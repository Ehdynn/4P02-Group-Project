export default function toTimestamptzIso (localDateTime){
  const getTimezoneOffset = (date) => {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
    const minutes = String(absoluteMinutes % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  };
  
  if (!localDateTime) {
    return null;
  }

  const [datePart, timePart] = localDateTime.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map((value) => Number(value));

  if (!year || !month || !day || hour === undefined || minute === undefined) {
    return null;
  }

  const localDate = new Date(year, month - 1, day, hour, minute);
  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return `${datePart}T${timePart}:00${getTimezoneOffset(localDate)}`;
};