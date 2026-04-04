export const formatToSriLankaTime = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);

  const options = {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
};