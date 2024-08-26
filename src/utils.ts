export function formatTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} hr`;
  } else if (minutes > 0) {
    formattedTime += `${minutes}:${seconds.toString().padStart(2, "0")} min`;
  } else {
    formattedTime += `${seconds} sec`;
  }

  return formattedTime;
}
