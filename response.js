const response = (payload, status, message) => {
  return {
    payload,
    status,
    message,
  };
};

module.exports = response;
