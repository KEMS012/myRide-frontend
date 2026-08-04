export function generateGoogleCalendarUrl({ title, start, end, details, location }) {
  const format = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = new URLSearchParams({
    text: title,
    dates: `${format(start)}/${format(end)}`,
    details: details,
    location: location,
  });
  return `${base}&${params.toString()}`;
}

export function generateICS({ title, start, end, details, location }) {
  const format = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyRyde//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@myryde`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}.ics`;
  link.click();
}
