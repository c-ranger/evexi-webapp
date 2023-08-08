import "./App.css";
import "./fonts/montserrat/Montserrat-Bold.ttf";
import { useAxios } from "./hooks/useAxios";
import Error from "./components/error";
import Upcoming from "./components/upcoming";
import SlotBooking from "./components/slot-booking";
import ScheduleContainer from "./components/schedule";
import Navbar from "./components/navbar";
import Progress from "./components/progress";

function App({ config }: { config: any }) {
  const { API_KEY, CID, LOGO, TEXT, error } = config;

  const startOfToday = new Date(new Date().setHours(0, 0, 0)).toISOString();
  const endOfToday = new Date(new Date().setHours(23, 59, 59)).toISOString();

  const [loading, events, _error, vacant] = useAxios<EventAPI>({
    method: "GET",
    url: `https://www.googleapis.com/calendar/v3/calendars/${CID}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true&timeMin=${startOfToday}&timeMax=${endOfToday}`,
  });

  if (error) {
    return <Error text={error} />;
  }

  if (_error) {
    return (
      <Error
        text={
          "Error fetching data from Google Calendar API. Please check config"
        }
      />
    );
  }

  if (loading || !events) return <div className="loading">Loading...</div>;

  const filteredEvents = events.items.filter((e: EventItem) => {
    const endOfEvent = Date.parse(e.end.dateTime);
    const now = Date.now();

    if (endOfEvent >= now) {
      return e;
    }
  });

  return (
    <div className="container">
      <div className="left-container">
        <Navbar logo={LOGO ?? null} />
        <div className="meeting-container">
          <h1>
            {JSON.parse(TEXT ?? "{}").MEETING_ROOM_NAME ?? "MEETING_ROOM_NAME"}
          </h1>
        </div>
        <Progress events={filteredEvents} />
        <Upcoming events={filteredEvents} />
        <SlotBooking
          text={JSON.parse(TEXT ?? "{}").BOOKING_TEXT ?? "BOOKING_TEXT"}
        />
      </div>
      <ScheduleContainer
        text={JSON.parse(TEXT ?? "{}").BOOKING_TEXT ?? "BOOKING_TEXT"}
        events={events}
        vacant={vacant}
      />
    </div>
  );
}

export default App;
