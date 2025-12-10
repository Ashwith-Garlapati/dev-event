import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { unstable_cache } from "next/cache";


const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)
const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
)
const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
)

interface EventResponse {
  event?: {
    _id: string,
    slug: string,
    title: string;
    description?: string;
    image: string;
    overview: string;
    date: string;
    time: string;
    location: string;
    mode: string;
    agenda: string[];
    audience: string;
    tags: string[];
    organizer: string;
  };
}

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
  }

const fetchEventBySlug = unstable_cache(
  async (slug: string): Promise<EventResponse["event"] | null> => {
    const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
      // Cache successful responses for 1 hour; errors are not cached.
      next: { revalidate: 60 * 60 },
    });

    if (response.status === 404) {
      // Do not throw here so a genuinely missing event can be treated as notFound()
      // by the page without turning it into a cached error state.
      return null;
    }

    if (!response.ok) {
      console.error("Failed to fetch event", {
        status: response.status,
        statusText: response.statusText,
        slug,
      });
      throw new Error(`Failed to fetch event: ${response.status} ${response.statusText}`);
    }

    const data: EventResponse = await response.json();

    return data?.event ?? null;
  },
  ["event-by-slug"],
  { revalidate: 60 * 60 }
);

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
  const { slug } = await params;

  let event: EventResponse["event"] | null = null;

  try {
    event = await fetchEventBySlug(slug);
  } catch (error) {
    console.error("Error while fetching event details", error);
    // Treat network/config issues as non-cached failures.
    return notFound();
  }

  if (!event) {
    // Not cached at the page level; only the successful data fetch is cached.
    return notFound();
  }

  const { title, description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

  if (!description) return notFound();

  const bookings = 10;

  const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} className="banner"/>

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags}/>
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent eventId={event._id} slug={event.slug} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 && similarEvents.map((similarEvent: any) => (
            <EventCard key={similarEvent.title} {...similarEvent}/>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EventDetailsPage