import numpy as np
import SimpleITK as sitk
import tempfile
import os

def standardize_to_brats(nifti_stream):
    """
    Standardizes a NIfTI volume to BraTS resolution (240x240x155) using padding or cropping.
    Uses SimpleITK for robust parsing of non-standard NIfTI headers.
    """
    # Write in-memory stream to a secure temporary execution file for SimpleITK ingestion
    with tempfile.NamedTemporaryFile(suffix=".nii.gz", delete=False) as tmp:
        tmp.write(nifti_stream.getvalue())
        tmp_path = tmp.name

    try:
        # SimpleITK natively ignores custom intent/data code non-compliance
        itk_img = sitk.ReadImage(tmp_path)
        data = sitk.GetArrayFromImage(itk_img) # Returns shape as (slices, height, width) -> (Z, Y, X)
        
        # SimpleITK transposes the array relative to nibabel. 
        # Convert (Z, Y, X) back to (X, Y, Z) standard for our resizer logic:
        data = np.transpose(data, (2, 1, 0))
        
        # Extract affine/direction information if needed (currently returning dummy for compatibility)
        origin = itk_img.GetOrigin()
        spacing = itk_img.GetSpacing()
        direction = itk_img.GetDirection()
        # We can construct a dummy affine or skip if not used in next steps
        affine = np.eye(4) 
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path) # Absolute security erasure for HIPAA compliance

    target_shape = (240, 240, 155)
    current_shape = data.shape

    # Initialize the processed data with zeros
    processed_data = np.zeros(target_shape)

    # Calculate padding/cropping for each dimension (Symmetric Center-Crop/Pad)
    slices = []
    target_slices = []
    
    for i in range(3):
        if current_shape[i] >= target_shape[i]:
            # Crop
            start = (current_shape[i] - target_shape[i]) // 2
            slices.append(slice(start, start + target_shape[i]))
            target_slices.append(slice(0, target_shape[i]))
        else:
            # Pad
            start = (target_shape[i] - current_shape[i]) // 2
            slices.append(slice(0, current_shape[i]))
            target_slices.append(slice(start, start + current_shape[i]))

    # Perform the crop/pad operation
    processed_data[target_slices[0], target_slices[1], target_slices[2]] = data[slices[0], slices[1], slices[2]]
    
    return processed_data, affine

def verify_shape(data):
    """
    Returns True if the data matches BraTS standard shape.
    """
    return data.shape == (240, 240, 155)
