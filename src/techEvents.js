const techEvents = {
    1900: "Max Planck proposes quantum theory.",
    1901: "Guglielmo Marconi transmits the first transatlantic radio signal.",
    1902: "First recorded powered flight (Wright brothers prepare for 1903).",
    1903: "Wright brothers achieve the first powered flight.",
    1904: "John Ambrose Fleming invents the vacuum tube.",
    1905: "Albert Einstein publishes the theory of special relativity.",
    1906: "First radio broadcast by Reginald Fessenden.",
    1907: "Leo Baekeland invents Bakelite, the first synthetic plastic.",
    1908: "Ford introduces the Model T, revolutionizing mass production.",
    1909: "First military use of airplanes.",
    1910: "Thomas Edison demonstrates talking motion pictures.",
    1911: "Superconductivity is discovered.",
    1912: "Sinking of the Titanic spurs advancements in maritime safety.",
    1913: "First assembly line by Henry Ford increases industrial efficiency.",
    1914: "Start of World War I drives advancements in military technology.",
    1915: "Einstein proposes the general theory of relativity.",
    1916: "First use of tanks in warfare.",
    1917: "Birth of cryptanalysis with the Zimmermann Telegram.",
    1918: "Spanish flu pandemic accelerates global medical responses.",
    1919: "First transatlantic flight by Alcock and Brown.",
    1920: "Arthur Eddington confirms Einstein’s general relativity.",
    1921: "Insulin is discovered, revolutionizing diabetes treatment.",
    1922: "First 3D movie shown to the public.",
    1923: "Garrett Morgan invents the modern traffic signal.",
    1924: "Edwin Hubble proves that the universe extends beyond the Milky Way.",
    1925: "John Logie Baird demonstrates the first working television.",
    1926: "Robert Goddard launches the first liquid-fueled rocket.",
    1927: "First transatlantic telephone call.",
    1928: "Discovery of penicillin by Alexander Fleming.",
    1929: "Fritz Pfleumer patents magnetic tape for recording sound.",
    1930: "Pluto is discovered.",
    1931: "Kurt Gödel publishes incompleteness theorems.",
    1932: "Carl Anderson discovers the positron (antimatter).",
    1933: "FM radio is invented.",
    1934: "Nuclear fission is theorized.",
    1935: "Radar technology is developed.",
    1936: "Alan Turing formalizes the concept of the Turing machine.",
    1937: "First jet engine is tested.",
    1938: "Nuclear fission is experimentally achieved.",
    1939: "World War II drives advancements in computing and rocketry.",
    1940: "Synthetic rubber is developed.",
    1941: "First programmable computer, the Z3, is created.",
    1942: "First controlled nuclear chain reaction (Manhattan Project).",
    1943: "Colossus, the first programmable digital computer, is built.",
    1944: "Harvard Mark I, an early electromechanical computer, is completed.",
    1945: "Atomic bombs dropped on Hiroshima and Nagasaki.",
    1946: "ENIAC, the first general-purpose electronic computer, is completed.",
    1947: "Invention of the transistor at Bell Labs.",
    1948: "Claude Shannon lays the foundation for digital communication theory.",
    1949: "First stored-program computer, the EDSAC, runs a program.",
    1950: "Alan Turing proposes the Turing Test for AI.",
    1951: "First commercial computer, the UNIVAC I, is sold.",
    1952: "First hydrogen bomb test.",
    1953: "DNA structure is discovered by Watson and Crick.",
    1954: "First nuclear power plant begins operation in the USSR.",
    1955: "First use of fiber optics in communication.",
    1956: "Artificial Intelligence field is officially founded.",
    1957: "Sputnik 1, the first artificial satellite, is launched.",
    1958: "First integrated circuit is developed.",
    1959: "First microchip is produced.",
    1960: "Laser is invented.",
    1961: "First human in space: Yuri Gagarin.",
    1962: "First communication satellite, Telstar, is launched.",
    1963: "Touch-tone telephones are introduced.",
    1964: "IBM releases System/360, the first modern mainframe computer.",
    1965: "Moore’s Law is formulated.",
    1966: "First demonstration of artificial intelligence in chess.",
    1967: "First successful heart transplant.",
    1968: "Douglas Engelbart demonstrates the first computer mouse.",
    1969: "ARPANET, the precursor to the Internet, is launched.",
    1970: "Intel introduces the first microprocessor.",
    1971: "First email is sent.",
    1972: "First video game console released (Magnavox Odyssey).",
    1973: "First mobile phone call is made.",
    1974: "Development of Ethernet.",
    1975: "Microsoft is founded.",
    1976: "Apple is founded.",
    1977: "First Apple II personal computer is released.",
    1978: "First GPS satellite is launched.",
    1979: "Sony introduces the Walkman.",
    1980: "IBM introduces the first PC.",
    1981: "First space shuttle flight.",
    1982: "Compact Disc (CD) is released.",
    1983: "The Internet adopts TCP/IP, enabling global networking.",
    1984: "Apple launches the Macintosh.",
    1985: "Microsoft releases Windows 1.0.",
    1986: "Chernobyl disaster leads to nuclear safety advancements.",
    1987: "First 3D video game, ‘The Last Ninja,’ is released.",
    1988: "First major Internet worm spreads online.",
    1989: "Tim Berners-Lee invents the World Wide Web.",
    1990: "Hubble Space Telescope is launched.",
    1991: "Linux operating system is created.",
    1992: "First text message is sent.",
    1993: "Mosaic, the first popular web browser, is released.",
    1994: "Amazon is founded.",
    1995: "Java is released.",
    1996: "Deep Blue defeats human chess champion for the first time.",
    1997: "Google is founded.",
    1998: "First MP3 player is released.",
    1999: "Wi-Fi is standardized.",
    2000: "Human Genome Project completes its first draft.",
    2001: "Wikipedia launches.",
    2002: "First complete draft of the human genome is published.",
    2003: "NASA's Spirit and Opportunity rovers land on Mars.",
    2004: "Facebook is founded, reshaping social media.",
    2005: "YouTube is launched, revolutionizing online video.",
    2006: "Twitter is founded, redefining microblogging.",
    2007: "Apple introduces the first iPhone, transforming mobile technology.",
    2008: "First Android smartphone is released, challenging iOS.",
    2009: "Bitcoin is launched, marking the start of decentralized finance.",
    2010: "Apple introduces the iPad, creating the tablet market.",
    2011: "IBM's Watson AI defeats human champions in Jeopardy.",
    2012: "Higgs boson is discovered at CERN, confirming the Standard Model.",
    2013: "CRISPR gene editing revolutionizes biotechnology.",
    2014: "Tesla launches the first mass-market electric car, the Model S.",
    2015: "AI beats professional Go player for the first time.",
    2016: "AlphaGo defeats world champion Lee Sedol in Go, showcasing deep learning's power.",
    2017: "CRISPR gene editing used in viable human embryos for the first time.",
    2018: "Waymo launches the first commercial self-driving taxi service.",
    2019: "First image of a black hole captured by the Event Horizon Telescope.",
    2020: "OpenAI releases GPT-3, revolutionizing natural language processing.",
    2021: "James Webb Space Telescope is successfully launched, offering unprecedented views of the universe.",
    2022: "Nuclear fusion breakthrough: scientists achieve net energy gain in fusion reaction.",
    2023: "AI becomes mainstream with ChatGPT and MidJourney.",
    2024: "Tools like ChatGPT, Claude, and Gemini became popular for content creation, coding, and problem solving ",
  };
  
  export default techEvents;