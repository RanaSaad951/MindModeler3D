import os
import sys
from pathlib import Path
import numpy as np
from config.db import get_pending_scans, update_scan_status
from utils.crypto_utils import decrypt_nifti_to_stream
from core.resizer import standardize_to_brats, verify_shape
from core.enhancer import apply_n4_bias_correction, z_score_normalize
from core.skull_stripper import remove_skull
import core.augmenter  # SRS FR3.4: Augmentations available for training mode

def run_pipeline():
    print("--- [Mind Modeler 3D] Preprocessing Pipeline Initialized ---")
    
    pending_scans = get_pending_scans()
    if not pending_scans:
        print("[Pipeline] No pending scans found.")
        return

    print(f"[Pipeline] Found {len(pending_scans)} pending scan(s). Starting batch processing...")

    for scan in pending_scans:
        scan_id = scan['_id']
        patient_name = scan.get('patientName', 'Anonymous')
        print(f"\n[Processing Batch] ID: {scan_id} | Patient: {patient_name}")
        
        try:
            # Map to hold standardized and normalized 3D volumes per modality
            modality_arrays = {}

            # We iterate through files in the batch. For preprocessing, we focus on NIfTI volumes.
            for file_info in scan.get('files', []):
                if file_info.get('fileType') != 'NIfTI':
                    continue
                
                modality = file_info.get('modality', 'Unknown')
                file_path = file_info.get('path')
                iv_hex = file_info.get('encryptionIV')
                
                if not iv_hex or iv_hex == "None":
                    print(f"  > [Skip] File missing valid encryption IV. Skipping file.")
                    continue
                
                print(f"  > Modality: {modality} | Status: Encrypted")
                
                # 1. Secure In-Memory Decryption
                decrypted_stream = decrypt_nifti_to_stream(file_path, iv_hex)
                print(f"  > [Security] Decryption Successful (In-Memory)")
                
                # 2. BraTS Standardization (240x240x155)
                standardized_data, affine = standardize_to_brats(decrypted_stream)

                # 3. Skull Stripping (SRS FR3.3)
                # BraTS data is pre-stripped — remove_skull bypasses automatically.
                # For raw clinical NIfTI, Otsu-based extraction runs as fallback.
                processed_data = remove_skull(standardized_data, dataset_type="BraTS")
                print(f"  > [Processing] Skull Stripping verified / bypassed (BraTS protocol).")

                # 4. Clinical Enhancement Layer
                # Apply N4 Bias Correction (Skip for Segmentation Masks)
                if modality != 'Segmentation Mask':
                    processed_data = apply_n4_bias_correction(processed_data)
                    print(f"  > [Enhancement] N4 Correction applied.")

                # Apply Intensity Normalization (Skip for Segmentation Masks)
                if modality != 'Segmentation Mask':
                    processed_data = z_score_normalize(processed_data)
                    print(f"  > [Enhancement] Z-Score Normalization applied.")
                
                if verify_shape(processed_data):
                    print(f"  > [Standardization] Success: Shape verified as {processed_data.shape}")
                    modality_arrays[modality] = processed_data.astype(np.float32)
                else:
                    print(f"  > [Standardization] FAILED: Shape is {standardized_data.shape}")
                    continue

            # 5. Multi-Channel Stacking (SRS FR3.4)
            # Standard BraTS input channel sequence: [T1, T1ce, T2, FLAIR]
            target_modalities = ['T1', 'T1ce', 'T2', 'FLAIR']
            channels_to_stack = []

            for mod in target_modalities:
                if mod in modality_arrays:
                    channels_to_stack.append(modality_arrays[mod])
                    print(f"  > [Stacking] Attached channel '{mod}' (shape: {modality_arrays[mod].shape})")
                else:
                    print(f"  > [Stacking] Warning: Modality '{mod}' missing from batch. Zero-filling channel.")
                    channels_to_stack.append(np.zeros((240, 240, 155), dtype=np.float32))

            # Assemble into 4D tensor with shape (4, 240, 240, 155)
            stacked_tensor = np.stack(channels_to_stack, axis=0)
            print(f"  > [Stacking] Multi-Channel 4D Tensor assembled: {stacked_tensor.shape}")

            # 6. Save Processed Tensor to Disk for Inference (Module 4)
            output_dir = Path(__file__).resolve().parent.parent / 'backend' / 'uploads'
            output_dir.mkdir(parents=True, exist_ok=True)
            output_filename = f"processed_{scan_id}.npy"
            output_path = output_dir / output_filename
            np.save(str(output_path), stacked_tensor)
            print(f"  > [Storage] Saved processed tensor to: {output_path}")

            # 7. Update MongoDB Scan Record
            update_metadata = {
                "preprocessingVersion": "1.0",
                "processed_tensor_path": str(output_path),
                "tensor_shape": list(stacked_tensor.shape)
            }
            update_scan_status(scan_id, "Analyzed", update_metadata)
            print(f"[Success] Batch {scan_id} fully processed, stacked, and saved.")

        except Exception as e:
            print(f"[Error] Failed to process batch {scan_id}: {str(e)}")
            import traceback
            traceback.print_exc()
            update_scan_status(scan_id, "Preprocessing Failed")

    print("\n--- [Pipeline] Batch Processing Complete ---")

if __name__ == "__main__":
    run_pipeline()
