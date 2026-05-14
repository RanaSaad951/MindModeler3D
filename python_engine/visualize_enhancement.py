"""
visualize_enhancement.py
────────────────────────────────────────────────────────────────────────────
Standalone diagnostic script for Mind Modeler 3D.

What it does:
  1. Connects to MongoDB and fetches the first available scan (any status).
  2. Picks the first T1 / FLAIR NIfTI file in that scan's file list.
  3. Decrypts it in-memory (SEC-2 compliant — nothing touches disk).
  4. Standardizes the volume to BraTS shape (240×240×155).
  5. Clones the raw array, then applies N4 Bias Correction + Z-Score Norm.
  6. Opens a matplotlib popup showing a Before vs After axial slice comparison.

Usage:
  cd python_engine
  python visualize_enhancement.py
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

# ── Local engine imports ────────────────────────────────────────────────────
from config.db       import get_db_client
from utils.crypto_utils import decrypt_nifti_to_stream
from core.resizer    import standardize_to_brats
from core.enhancer   import apply_n4_bias_correction, z_score_normalize


# ── Constants ───────────────────────────────────────────────────────────────
PREFERRED_MODALITIES = {"T1", "T1ce", "T1 Post-Contrast", "FLAIR", "T2"}
AXIAL_SLICE_INDEX    = 77   # Middle of the 155-slice Z axis


# ── Step 1: Fetch first available scan from MongoDB ─────────────────────────
def fetch_first_scan():
    print("[DB] Connecting to MongoDB...")
    client = get_db_client()
    db     = client.get_database()
    scans  = db["scans"]

    # Fetch the most recently uploaded scan (sort by _id desc — ObjectIDs are time-ordered)
    scan = scans.find_one({}, sort=[("_id", -1)])
    if scan is None:
        print("[Error] No scans found in the database. Upload at least one scan first.")
        sys.exit(1)

    scan_id      = scan.get("_id")
    patient_name = scan.get("patientName", "Unknown")
    print(f"[DB] Found latest scan — ID: {scan_id} | Patient: {patient_name}")
    return scan


# ── Step 2: Pick the best NIfTI file from the scan's file list ──────────────
def pick_nifti_file(scan):
    """
    Supports two scan document schemas:
      - Flat (legacy):  filePath / fileType at root level, no encryptionIV
      - Nested (batch): files[] array with path / fileType / encryptionIV per entry
    """
    # ── Nested batched schema ────────────────────────────────────────────────
    files = scan.get("files", [])
    if files:
        nifti_files = [f for f in files if f.get("fileType") == "NIfTI"]
        preferred   = [f for f in nifti_files if f.get("modality") in PREFERRED_MODALITIES]
        chosen      = preferred[0] if preferred else (nifti_files[0] if nifti_files else None)

        if chosen:
            modality = chosen.get("modality", "Unknown")
            path     = chosen.get("path")
            iv_hex   = chosen.get("encryptionIV")
            print(f"[File] Schema: nested batch | Modality: {modality}")
            print(f"[File] Path: {path}")
            if not iv_hex or iv_hex == "None":
                print("[Error] Chosen file has no valid encryption IV.")
                sys.exit(1)
            return path, iv_hex, modality

    # ── Flat legacy schema ───────────────────────────────────────────────────
    file_type = scan.get("fileType")
    if file_type == "NIfTI":
        path     = scan.get("filePath")
        iv_hex   = scan.get("encryptionIV")   # may be absent on legacy scans
        modality = scan.get("modality", "T1") # default label for legacy flat scans
        print(f"[File] Schema: flat legacy | Modality: {modality}")
        print(f"[File] Path: {path}")
        return path, iv_hex, modality

    print("[Error] No usable NIfTI file found in this scan document.")
    sys.exit(1)


# ── Step 3: Run the full processing chain ───────────────────────────────────
def build_arrays(file_path, iv_hex):
    import io
    import nibabel as nib

    # Decrypt in-memory if IV is present; otherwise read the file directly
    if iv_hex and iv_hex != "None":
        print("[Crypto] Decrypting NIfTI file (in-memory)...")
        stream = decrypt_nifti_to_stream(file_path, iv_hex)
        print("[Crypto] Decryption successful.")
    else:
        print("[Crypto] No encryption IV — reading raw NIfTI file directly (legacy scan).")
        with open(file_path, "rb") as f:
            stream = io.BytesIO(f.read())

    # BraTS standardization → (240, 240, 155)
    print("[Resizer] Standardizing to BraTS shape (240×240×155)...")
    standardized_data, _ = standardize_to_brats(stream)
    print(f"[Resizer] Shape confirmed: {standardized_data.shape}")

    # Preserve raw copy BEFORE any enhancement
    original_data = standardized_data.copy()

    # N4 Bias Correction
    print("[N4] Applying optimized Shrink & Mask N4 Bias Correction...")
    corrected_data = apply_n4_bias_correction(original_data)
    print("[N4] Done.")

    # Z-Score Normalization
    print("[Norm] Applying Z-Score Intensity Normalization...")
    enhanced_data = z_score_normalize(corrected_data)
    print("[Norm] Done.")

    return original_data, enhanced_data


# ── Step 4: Render the side-by-side comparison ──────────────────────────────
def render_comparison(original_data, enhanced_data, modality):
    slice_idx = min(AXIAL_SLICE_INDEX, original_data.shape[2] - 1)

    orig_slice     = original_data[:, :, slice_idx]
    enhanced_slice = enhanced_data[:, :, slice_idx]

    # ── Figure layout ───────────────────────────────────────────────────────
    fig = plt.figure(figsize=(14, 7), facecolor="#0d0d0d")
    fig.suptitle(
        f"MRI Enhancement Comparison  |  Modality: {modality}  |  Axial Slice Z={slice_idx}",
        color="white", fontsize=14, fontweight="bold", y=0.98
    )

    gs = gridspec.GridSpec(1, 2, figure=fig, wspace=0.08)

    # ── Left: Before ────────────────────────────────────────────────────────
    ax1 = fig.add_subplot(gs[0])
    im1 = ax1.imshow(np.rot90(orig_slice), cmap="gray", aspect="equal")
    ax1.set_title("BEFORE\nRaw Standardization", color="#00e5ff",
                  fontsize=12, fontweight="bold", pad=10)
    ax1.axis("off")
    cbar1 = fig.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04)
    cbar1.ax.yaxis.set_tick_params(color="white")
    cbar1.outline.set_edgecolor("white")
    plt.setp(cbar1.ax.yaxis.get_ticklabels(), color="white", fontsize=8)
    cbar1.set_label("Raw Intensity (a.u.)", color="#aaaaaa", fontsize=9)

    # ── Right: After ────────────────────────────────────────────────────────
    ax2 = fig.add_subplot(gs[1])
    im2 = ax2.imshow(np.rot90(enhanced_slice), cmap="gray", aspect="equal")
    ax2.set_title("AFTER\nN4 Correction + Z-Score Normalization", color="#39ff14",
                  fontsize=12, fontweight="bold", pad=10)
    ax2.axis("off")
    cbar2 = fig.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04)
    cbar2.ax.yaxis.set_tick_params(color="white")
    cbar2.outline.set_edgecolor("white")
    plt.setp(cbar2.ax.yaxis.get_ticklabels(), color="white", fontsize=8)
    cbar2.set_label("Normalized Intensity (σ units)", color="#aaaaaa", fontsize=9)

    # ── Footer stats ────────────────────────────────────────────────────────
    orig_min, orig_max   = orig_slice.min(),     orig_slice.max()
    enh_min,  enh_max    = enhanced_slice.min(), enhanced_slice.max()
    enh_mean, enh_std    = enhanced_slice.mean(), enhanced_slice.std()

    stats_text = (
        f"Before  → min: {orig_min:.2f}  max: {orig_max:.2f}\n"
        f"After   → min: {enh_min:.3f}  max: {enh_max:.3f}  "
        f"μ: {enh_mean:.4f}  σ: {enh_std:.4f}"
    )
    fig.text(0.5, 0.01, stats_text, ha="center", va="bottom",
             color="#888888", fontsize=9, fontfamily="monospace")

    plt.tight_layout(rect=[0, 0.04, 1, 0.95])
    print("\n[Visualizer] Rendering popup window... (close the window to exit)")
    plt.show()


# ── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Mind Modeler 3D — Preprocessing Enhancement Visualizer")
    print("=" * 60)

    scan              = fetch_first_scan()
    file_path, iv_hex, modality = pick_nifti_file(scan)
    original_data, enhanced_data = build_arrays(file_path, iv_hex)
    render_comparison(original_data, enhanced_data, modality)

    print("[Done] Visualizer exited cleanly.")
