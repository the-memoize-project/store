const Id = {
  new() {
    return Math.random().toString(32).slice(2);
  }
}

export default Id
