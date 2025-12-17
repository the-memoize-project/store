const env = {
  handle(data) {
    Object.assign(this, data);
    return this;
  },
};

export default env;
