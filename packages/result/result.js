const Result = new Proxy(
  {},
  {
    get:
      (_, variant) =>
      (...values) => ({
        match: (handlers = {}) => {
          const target = Object.hasOwn(handlers, variant)
            ? handlers[variant]
            : handlers._;
          return target?.(...values);
        },

        unwrap: (fallback) =>
          (values.length > 1 ? values : values[0]) || fallback,
      }),
  },
);

export default Result;
