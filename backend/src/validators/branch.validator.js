import validator from 'validator';
import { BRANCH_STATUS } from '../constants/branch.constants.js';
import { AppError } from '../utils/AppError.js';

const assertString = (value, field, { required = true, max = 500 } = {}) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    if (required) throw new AppError(`${field} is required`, 400);
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new AppError(`${field} must be ${max} characters or fewer`, 400);
  }
  return trimmed;
};

const optionalUrl = (value, field) => {
  const normalized = assertString(value, field, { required: false, max: 1000 });
  if (normalized && !validator.isURL(normalized, { require_protocol: true })) {
    throw new AppError(`${field} must be a valid URL`, 400);
  }
  return normalized;
};

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const normalized = status.toString().trim().toUpperCase();
  if (!Object.values(BRANCH_STATUS).includes(normalized)) {
    throw new AppError('Branch status is invalid', 400);
  }
  return normalized;
};

export const validateCreateBranch = (body) => ({
  name: assertString(body.name, 'Branch name', { max: 100 }),
  address: assertString(body.address, 'Address'),
  contactNumber: assertString(body.contactNumber, 'Contact number', { max: 20 }),
  openingTime: assertString(body.openingTime, 'Opening time', { max: 20 }),
  closingTime: assertString(body.closingTime, 'Closing time', { max: 20 }),
  googleMapLink: optionalUrl(body.googleMapLink, 'Google map link'),
  image: body.imageUrl
    ? {
        url: optionalUrl(body.imageUrl, 'Branch image URL'),
        publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
      }
    : undefined,
  status: normalizeStatus(body.status),
  isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined
});

export const validateUpdateBranch = (body) => {
  const payload = {};

  if ('name' in body) payload.name = assertString(body.name, 'Branch name', { max: 100 });
  if ('address' in body) payload.address = assertString(body.address, 'Address');
  if ('contactNumber' in body) payload.contactNumber = assertString(body.contactNumber, 'Contact number', { max: 20 });
  if ('openingTime' in body) payload.openingTime = assertString(body.openingTime, 'Opening time', { max: 20 });
  if ('closingTime' in body) payload.closingTime = assertString(body.closingTime, 'Closing time', { max: 20 });
  if ('googleMapLink' in body) payload.googleMapLink = optionalUrl(body.googleMapLink, 'Google map link');
  if ('status' in body) payload.status = normalizeStatus(body.status);
  if ('isActive' in body && typeof body.isActive === 'boolean') payload.isActive = body.isActive;
  if ('imageUrl' in body) {
    payload.image = body.imageUrl
      ? {
          url: optionalUrl(body.imageUrl, 'Branch image URL'),
          publicId: assertString(body.imagePublicId, 'Image public ID', { required: false, max: 200 })
        }
      : undefined;
  }

  return payload;
};

export const validateBranchStatus = (body) => ({
  status: normalizeStatus(body.status)
});
