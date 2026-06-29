export const getFormattedJsonFromString = (json: string) => {
  let jsonStr
  try {
    jsonStr = JSON.stringify(JSON.parse(json), null, 2)
  } catch (e) {
    jsonStr = json
  }

  return jsonStr
}
