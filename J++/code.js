const code = `
ye a = 0
ye sum = 0
ye limit = 7

jabtak a < limit {
  a = a + 1
  agar a == 2 {
    continue
  } nahi agar a == 4 {
    bol 999
    continue
  } nahi agar a == 6 {
    break
  }
  sum = sum + a
  bol a
}

bol sum

ke liye i = 0 tak 6 {
  agar i == 3 {
    bol 888
    break
  }
  bol i
}

agar sum < 5 {
  bol 100
} nahi agar sum < 10 {
  bol 200
} nahi {
  bol 300
}

bol a
bol sum
bol limit

`;
module.exports = code;