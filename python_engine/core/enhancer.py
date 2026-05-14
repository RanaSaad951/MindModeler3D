import numpy as np
import SimpleITK as sitk

def apply_n4_bias_correction(np_array):
    """
    Applies N4 Bias Field Correction using the industry-standard Shrink & Mask
    optimization. The bias field (a low-frequency signal) is computed on a 4x
    downsampled volume for speed, then projected back onto the full-resolution
    image — clinically equivalent but ~64x faster than naive full-volume N4.

    Input:  NumPy array in (X, Y, Z) format.
    Output: Corrected NumPy array in (X, Y, Z) format.
    """
    try:
        # Convert (X, Y, Z) → SimpleITK (Z, Y, X), cast to float32
        itk_img = sitk.GetImageFromArray(
            np.transpose(np_array, (2, 1, 0)).astype(np.float32)
        )

        # 1. Build Otsu foreground mask to exclude background from estimation
        mask_image = sitk.OtsuThreshold(itk_img, 0, 1, 200)

        # 2. Shrink image & mask by factor 4 — bias field is low-frequency,
        #    so sub-sampled estimation is fully sufficient
        shrink_factor = [4, 4, 4]
        shrunk_img  = sitk.Shrink(itk_img,    shrink_factor)
        shrunk_mask = sitk.Shrink(mask_image, shrink_factor)

        # 3. Run N4 on the small volume (seconds instead of hours)
        corrector = sitk.N4BiasFieldCorrectionImageFilter()
        corrector.Execute(shrunk_img, shrunk_mask)

        # 4. Extract the log-bias field and up-sample it back to original size,
        #    then correct the full-resolution image
        log_bias_field    = corrector.GetLogBiasFieldAsImage(itk_img)
        corrected_img_full = itk_img / sitk.Exp(log_bias_field)

        # Convert back to (X, Y, Z) NumPy order
        return np.transpose(sitk.GetArrayFromImage(corrected_img_full), (2, 1, 0))

    except Exception as e:
        print(f"  > [Warning] N4 Bias Correction failed: {str(e)}. Skipping correction.")
        return np_array

def z_score_normalize(np_array):
    """
    Performs intensity normalization using Z-Score (Zero Mean, Unit Variance).
    Calculates stats ONLY on foreground (non-zero) voxels to avoid background bias.
    """
    mask = np_array > 0
    if not np.any(mask):
        return np_array
        
    foreground = np_array[mask]
    mean = foreground.mean()
    std = foreground.std()
    
    # Avoid division by zero
    if std < 1e-8:
        return np_array
        
    normalized = np.zeros_like(np_array, dtype=np.float32)
    normalized[mask] = (np_array[mask] - mean) / std
    
    return normalized
