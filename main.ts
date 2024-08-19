const Cookie =
  "dzr_uniq_id=dzr_uniq_id_fr980721c9311a19717253cc512c2cf81c31e950; _abck=1CCF1C3853E9BADEFE2DD95F16D4E347~0~YAAQC5HdWPtczF6RAQAAVAwRYQy5vdMSCJrXe3n9AgBsbo6KfYgKLgkYIHuSTG7J/PNfqLaYtASrYxgwBu64oYPIXdfzWqIpKB5F0CI6RYlggDm8+P0PgU1Uq//+Aej4hqPJ1vNs+7tTSPlWQ5yJPR0pu22J3q+5pZ/du5jYTLAEIQJlgJYq9Em8/b5/dHqRd08YQh//GGbQLtfcddmqT/tV23sdBsBRO1YqddC9Zs42Rb6YUpa4I3e5zmvO1rX9fJP3ZmHoRuT5Xi+reMOftSusZmdaR1XBY85zO+g93rmnUdLlPAR+YP7f7om5isBCm8LopcSuIzDArrdwNCkZ6Lrg9m6HkMXZG0MGe6yIRldQSEX6zhENHTuf4k2ZC6oTjpvUC1Y/y0C/mloNTp8bMciK5WLCTPGW5Gc/X9uDOdXRhw7JlVRR9PVz4G2ZiliJU5sUvk1OESOobqspr97tc3pzww==~-1~-1~-1; arl=0999a44dd231d62cd8ddd09452a658d609a4d826d02eff37cf1214e63dbde11c237e35994bec3e6c1f8ca68ae76e8ff86aa5c66ab807e6b14e29c38c38a16a3bf4e7fe148e911ec130a7b534a5e64a271794c0e056f61aac3e2223af40436cb4; comeback=1; sid=fr49c9fe54405a1b59dd866f531a7e8f9b180a09; bm_sz=8698883A8BFBF72B8DAE9093A3F995B5~YAAQOJHdWB1EAF2RAQAA+zEXYRgZUIcww7PH+p79tUPqfJcRbbiAB0ttqARWq7OR8rzrNbGz3ODRTUlXYjy/zlBvtUE4m/8Wa8P5EB1v32rxNMRg5DYdMkQ/0tawMOAJMr3f7mzJTnjnNx2cx31nalHnetcuM34Fp0etScD65AUOsvW2yD0c5hbvw44IcdVL9XRCu+e2pb9a97yigTbgJvIs3Tj2fIQ02RPwKPG3zI8UBRDmTwlZwTLTAcCTrqptMg8rGeDPy43x+c7IA/w9W5ZNIXfk1GygfXhF77wMSeQD9RY0jZaS28nNDZimKMQObRo5NjhOpSSbyysbx0Y+BlzK/fsJFbZHQFtkAjD2Zot+Ck6aKr8H9cLVHwJtTUsVVzywQRpig4TRFZC57Le5xuplPBjeUb8ASxdwQvW4vhc0Tu6/DUm7YjOsV98=~3491127~3228483; account_id=2145397302; familyUserId=2145397302; ab.storage.deviceId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3A6f404797-402c-d047-e08a-b19fa0843e00%7Ce%3Aundefined%7Cc%3A1723910799199%7Cl%3A1723910799209; ab.storage.userId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3A2145397302%7Ce%3Aundefined%7Cc%3A1723910799207%7Cl%3A1723910799209; ab.storage.sessionId.5ba97124-1b79-4acc-86b7-9547bc58cb18=g%3A4acefa15-9494-3cfd-d558-ce16b8ddaff2%7Ce%3A1723912599212%7Cc%3A1723910799208%7Cl%3A1723910799212; refresh-token=l3eQ4U_5ZVlM9jDvTs5djTIxNDUzOTczMDJ8VI7XH-POJyXGmtTwF4VeNCZ6DIs_tuTyfPeEYK1-YkQ7XK97TuCMnDDBRCzRedkGMxJ0gYxkYfpstJ_JLQrnLMwOXrabXH8d0O5Pumo29DFV7jxW1AsDC_N7p54XhrupeFn21o2mU9ILa7RSnD_h6K8kASENStiUZP3MpOVjnqA=; pageviewCount=1; consentMarketing=1; consentStatistics=1; ajs_user_id=2145397302; ajs_anonymous_id=04060034-f631-4554-9184-db191e02bfae; ry_ry-m42x3nc3_realytics=eyJpZCI6InJ5X0I2NTMzMDM0LTY3RDctNDZEQS04NDM1LTg2MjhFNjZDNDhCQyIsImNpZCI6bnVsbCwiZXhwIjoxNzU1NDQ2ODAwMzI4LCJjcyI6bnVsbH0%3D; ry_ry-m42x3nc3_so_realytics=eyJpZCI6InJ5X0I2NTMzMDM0LTY3RDctNDZEQS04NDM1LTg2MjhFNjZDNDhCQyIsImNpZCI6bnVsbCwib3JpZ2luIjp0cnVlLCJyZWYiOm51bGwsImNvbnQiOm51bGwsIm5zIjpmYWxzZSwic2MiOm51bGwsInNwIjoiZGVlemVyIn0%3D; _pin_unauth=dWlkPVpqRmpNMk0wWldRdE1UVTJaUzAwTTJVNUxUaGpZbVV0TkdNM05XWTRZVGcxTW1VMQ";

async function main() {
  const res = await fetch(
    "https://www.deezer.com/ajax/gw-light.php?method=deezer.pagePlaylist&input=3&api_version=1.0&api_token=qeaQzIPx-QCtAglOcTUen3zXOhrBqsO6&cid=128476388",
    {
      body: '{"playlist_id":"11797541801","nb":10000,"start":0,"lang":"us","tab":0,"tags":true,"header":true}',
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        Cookie,
      },
      method: "",
    }
  );

  const json = await res.json();

  console.log(json);
}

main().then();
