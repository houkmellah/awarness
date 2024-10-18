function getInitials(fullName) {
    if (!fullName) return "";
  
    return fullName
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .join("");
}
  
export default getInitials