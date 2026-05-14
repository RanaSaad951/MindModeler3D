import numpy as np


# ── SRS FR3.4: Data Augmentation Module ──────────────────────────────────────
# These augmentations are reserved for TRAINING MODE only.
# Do NOT apply during inference preprocessing — augmentation during inference
# introduces artificial distribution shift and degrades model accuracy.
#
# Usage in training loop:
#   from core.augmenter import apply_horizontal_flip, apply_rotation
#   augmented = apply_horizontal_flip(volume)
#   augmented = apply_rotation(volume, axes=(0, 1))
# ─────────────────────────────────────────────────────────────────────────────


def apply_horizontal_flip(np_array):
    """
    Flips the MRI volume along the X axis (left–right mirror).

    Simulates the natural anatomical variation between left-dominant and
    right-dominant brain structures, doubling effective training set size
    without collecting new data.

    Args:
        np_array (np.ndarray): 3D volume in (X, Y, Z) format.

    Returns:
        np.ndarray: Horizontally flipped volume, same shape and dtype.
    """
    return np.flip(np_array, axis=0).copy()


def apply_rotation(np_array, axes=(0, 1)):
    """
    Rotates the MRI volume 90° in the plane defined by `axes`.

    Introduces rotational invariance during training — teaches the model
    that brain anatomy is valid regardless of minor acquisition orientation
    differences across scanners and sites.

    Args:
        np_array (np.ndarray): 3D volume in (X, Y, Z) format.
        axes          (tuple): Two axes defining the rotation plane.
                               Default (0, 1) rotates in the axial plane.
                               Use (0, 2) for coronal, (1, 2) for sagittal.

    Returns:
        np.ndarray: Rotated volume (may change shape if axes differ in size).
    """
    return np.rot90(np_array, k=1, axes=axes).copy()


def apply_random_noise(np_array, noise_std=0.01):
    """
    Adds small Gaussian noise to simulate scanner noise variation.

    Args:
        np_array  (np.ndarray): 3D volume in (X, Y, Z) format, float32.
        noise_std     (float):  Standard deviation of Gaussian noise (default 0.01).
                                Keep small relative to normalized intensity range.

    Returns:
        np.ndarray: Noisy volume, same shape and dtype.
    """
    noise = np.random.normal(0, noise_std, np_array.shape).astype(np.float32)
    return np_array + noise
