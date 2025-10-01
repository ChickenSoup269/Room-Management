import React from "react"

const units = ["", "nghìn", "triệu", "tỷ"]
const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
const tens = [
  "",
  "mười",
  "hai mươi",
  "ba mươi",
  "bốn mươi",
  "năm mươi",
  "sáu mươi",
  "bảy mươi",
  "tám mươi",
  "chín mươi",
]
const teens = [
  "mười",
  "mười một",
  "mười hai",
  "mười ba",
  "mười bốn",
  "mười lăm",
  "mười sáu",
  "mười bảy",
  "mười tám",
  "mười chín",
]

function numberToWords(num: number): string {
  if (num === 0) return "không đồng"

  let word = ""
  let unitIndex = 0

  while (num > 0) {
    const chunk = num % 1000
    if (chunk > 0) {
      word =
        chunkToWords(chunk) +
        (units[unitIndex] ? " " + units[unitIndex] : "") +
        (word ? " " + word : "")
    }
    num = Math.floor(num / 1000)
    unitIndex++
  }

  return word.trim() + " đồng"
}

function chunkToWords(chunk: number): string {
  let word = ""

  const hundreds = Math.floor(chunk / 100)
  if (hundreds > 0) {
    word += ones[hundreds] + " trăm "
  }

  const remainder = chunk % 100
  if (remainder >= 20) {
    const ten = Math.floor(remainder / 10)
    const one = remainder % 10
    word += tens[ten] + (one > 0 ? " " + ones[one] : "")
  } else if (remainder >= 10) {
    word += teens[remainder - 10]
  } else if (remainder > 0) {
    word += ones[remainder]
  }

  return word.trim()
}

export default function NumberToWords({ amount }: { amount: number }) {
  return <span>{numberToWords(amount)}</span>
}
