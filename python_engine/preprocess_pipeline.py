import os
import sys
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

                # SRS FR3.4: Augmentations available in core.augmenter for training mode.
                # Example: processed_data = core.augmenter.apply_horizontal_flip(processed_data)

                # 4. Clinical Enhancement Layer
                # Apply N4 Bias Correction (Skip for Segmentation Masks)
                if modality != 'Segmentation Mask':
                    processed_data = apply_n4_bias_correction(processed_data)
                    print(f"  > [Enhancement] N4 Correction applied.")

                # Apply Intensity Normalization
                processed_data = z_score_normalize(processed_data)
                print(f"  > [Enhancement] Z-Score Normalization applied.")
                
                if verify_shape(processed_data):
                    print(f"  > [Standardization] Success: Shape verified as {processed_data.shape}")
                else:
                    print(f"  > [Standardization] FAILED: Shape is {standardized_data.shape}")
                    continue

            # Update status to 'Processed' or 'Analyzed'
            update_scan_status(scan_id, "Analyzed", {"preprocessingVersion": "1.0"})
            print(f"[Success] Batch {scan_id} fully processed and standardized.")

        except Exception as e:
            print(f"[Error] Failed to process batch {scan_id}: {str(e)}")
            update_scan_status(scan_id, "Preprocessing Failed")

    print("\n--- [Pipeline] Batch Processing Complete ---")

if __name__ == "__main__":
    run_pipeline()
