const isPollExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

export default isPollExpired;