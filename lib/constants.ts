export type Event = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: Event[] = [
  {
    title: 'React Summit 2024',
    image: '/images/event1.png',
    slug: 'react-summit-2024',
    location: 'Amsterdam, Netherlands',
    date: '2024-06-14',
    time: '09:00 - 18:00',
  },
  {
    title: 'ETHGlobal New York',
    image: '/images/event2.png',
    slug: 'ethglobal-new-york-2024',
    location: 'New York, USA',
    date: '2024-09-20',
    time: '10:00 - 20:00',
  },
  {
    title: 'JSConf EU',
    image: '/images/event3.png',
    slug: 'jsconf-eu-2024',
    location: 'Berlin, Germany',
    date: '2024-08-10',
    time: '08:30 - 17:30',
  },
  {
    title: 'HackMIT 2024',
    image: '/images/event4.png',
    slug: 'hackmit-2024',
    location: 'Cambridge, MA, USA',
    date: '2024-09-14',
    time: '09:00 - 21:00',
  },
  {
    title: 'Google I/O Extended',
    image: '/images/event5.png',
    slug: 'google-io-extended-2024',
    location: 'Mountain View, CA, USA',
    date: '2024-05-28',
    time: '10:00 - 17:00',
  },
  {
    title: 'Devcon 7',
    image: '/images/event6.png',
    slug: 'devcon-7-2024',
    location: 'Southeast Asia (TBA)',
    date: '2024-11-12',
    time: '09:30 - 18:30',
  },
  {
    title: 'Open Source Summit North America',
    image: '/images/event-full.png',
    slug: 'open-source-summit-na-2024',
    location: 'Seattle, WA, USA',
    date: '2024-07-15',
    time: '08:00 - 17:00',
  },
];
