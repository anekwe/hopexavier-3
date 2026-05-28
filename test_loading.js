function test() {
  let loading = true;
  function setLoading(v) { loading = v; }
  
  async function fetchApps() {
    let showFullLoader = true;
    if (showFullLoader) setLoading(true);
    try {
      if (true) {
        return; // early return
      }
    } catch (e) {
    } finally {
      if (showFullLoader) setLoading(false);
    }
  }
  
  fetchApps().then(() => console.log("loading is:", loading));
}
test();
