'use strict';

/**
 * IPL 2026 Player Pool Seed â€” authoritative roster from /v2/ipl2026_squads (Cricbuzz)
 *
 * country:   "India" = Indian national | "Overseas" = foreign national
 * basePrice: fantasy auction base price in Cr â€” tiered by player quality:
 *   2.0 Cr  = Elite superstars
 *   1.5 Cr  = Premium internationals / marquee Indians
 *   1.0 Cr  = Established internationals / top IPL performers
 *   0.5 Cr  = Regular IPL players
 *   0.3 Cr  = Young / uncapped / fringe players
 *
 * Run: node db/seed.js
 */

const players = [

  // â”€â”€â”€ RCB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Virat Kohli",        iplTeam: "RCB", role: "Batsman",      country: "India",    basePrice: 2.0, cricbuzzId: 1413,    cricbuzzName: "Virat Kohli",        slug: "virat-kohli" },
  { playerName: "Rajat Patidar",      iplTeam: "RCB", role: "Batsman",      country: "India",    basePrice: 1.0, cricbuzzId: 10636,   cricbuzzName: "Rajat Patidar",      slug: "rajat-patidar" },
  { playerName: "Devdutt Padikkal",   iplTeam: "RCB", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 13088,   cricbuzzName: "Devdutt Padikkal",   slug: "devdutt-padikkal" },
  { playerName: "Venkatesh Iyer",     iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 10917,   cricbuzzName: "Venkatesh Iyer",     slug: "venkatesh-iyer" },
  { playerName: "Krunal Pandya",      iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 11311,   cricbuzzName: "Krunal Pandya",      slug: "krunal-pandya" },
  { playerName: "Romario Shepherd",   iplTeam: "RCB", role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 13646,   cricbuzzName: "Romario Shepherd",   slug: "romario-shepherd" },
  { playerName: "Jacob Bethell",      iplTeam: "RCB", role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 19636,   cricbuzzName: "Jacob Bethell",      slug: "jacob-bethell" },
  { playerName: "Phil Salt",          iplTeam: "RCB", role: "WicketKeeper", country: "Overseas", basePrice: 1.0, cricbuzzId: 10479,   cricbuzzName: "Phil Salt",          slug: "philip-salt" },
  { playerName: "Jitesh Sharma",      iplTeam: "RCB", role: "WicketKeeper", country: "India",    basePrice: 0.5, cricbuzzId: 10214,   cricbuzzName: "Jitesh Sharma",      slug: "jitesh-sharma" },
  { playerName: "Jordan Cox",         iplTeam: "RCB", role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 14813,   cricbuzzName: "Jordan Cox",         slug: "jordan-cox" },
  { playerName: "Tim David",          iplTeam: "RCB", role: "Batsman",      country: "Overseas", basePrice: 1.0, cricbuzzId: 13169,   cricbuzzName: "Tim David",          slug: "tim-david" },
  { playerName: "Josh Hazlewood",     iplTeam: "RCB", role: "Bowler",       country: "Overseas", basePrice: 1.0, cricbuzzId: 6258,    cricbuzzName: "Josh Hazlewood",     slug: "josh-hazlewood" },
  { playerName: "Bhuvneshwar Kumar",  iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 1726,    cricbuzzName: "Bhuvneshwar Kumar",  slug: "bhuvneshwar-kumar" },
  { playerName: "Jacob Duffy",        iplTeam: "RCB", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 8554,    cricbuzzName: "Jacob Duffy",        slug: "jacob-duffy" },
  { playerName: "Suyash Sharma",      iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 36487,   cricbuzzName: "Suyash Sharma",      slug: "suyash-sharma" },
  { playerName: "Rasikh Salam Dar",   iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 14274,   cricbuzzName: "Rasikh Salam Dar",   slug: "rasikh-salam-dar" },
  { playerName: "Vicky Ostwal",       iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 22616,   cricbuzzName: "Vicky Ostwal",       slug: "vicky-ostwal" },
  { playerName: "Swapnil Singh",      iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 10238,   cricbuzzName: "Swapnil Singh",      slug: "swapnil-singh" },
  { playerName: "Abhinandan Singh",   iplTeam: "RCB", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1447073, cricbuzzName: "Abhinandan Singh",   slug: "abhinandan-singh" },
  { playerName: "Mangesh Yadav",      iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1455995, cricbuzzName: "Mangesh Yadav",      slug: "mangesh-yadav" },
  { playerName: "Kanishk Chouhan",    iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1457033, cricbuzzName: "Kanishk Chouhan",    slug: "kanishk-chouhan" },
  { playerName: "Vihaan Malhotra",    iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1430529, cricbuzzName: "Vihaan Malhotra",    slug: "vihaan-malhotra" },
  { playerName: "Satvik Deswal",      iplTeam: "RCB", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1457482, cricbuzzName: "Satvik Deswal",      slug: "satvik-deswal" },

  // â”€â”€â”€ SRH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Travis Head",        iplTeam: "SRH", role: "Batsman",      country: "Overseas", basePrice: 1.5, cricbuzzId: 8497,    cricbuzzName: "Travis Head",        slug: "travis-head" },
  { playerName: "Abhishek Sharma",    iplTeam: "SRH", role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 12086,   cricbuzzName: "Abhishek Sharma",    slug: "abhishek-sharma" },
  { playerName: "Nitish Reddy",       iplTeam: "SRH", role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 14701,   cricbuzzName: "Nitish Reddy",       slug: "nitish-kumar-reddy" },
  { playerName: "Liam Livingstone",   iplTeam: "SRH", role: "AllRounder",   country: "Overseas", basePrice: 1.0, cricbuzzId: 10045,   cricbuzzName: "Liam Livingstone",   slug: "liam-livingstone" },
  { playerName: "Kamindu Mendis",     iplTeam: "SRH", role: "AllRounder",   country: "Overseas", basePrice: 1.0, cricbuzzId: 10940,   cricbuzzName: "Kamindu Mendis",     slug: "kamindu-mendis" },
  { playerName: "Ishan Kishan",       iplTeam: "SRH", role: "WicketKeeper", country: "India",    basePrice: 1.0, cricbuzzId: 10276,   cricbuzzName: "Ishan Kishan",       slug: "ishan-kishan" },
  { playerName: "Heinrich Klaasen",   iplTeam: "SRH", role: "WicketKeeper", country: "Overseas", basePrice: 1.0, cricbuzzId: 10209,   cricbuzzName: "Heinrich Klaasen",   slug: "heinrich-klaasen" },
  { playerName: "Harsh Dubey",        iplTeam: "SRH", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 14695,   cricbuzzName: "Harsh Dubey",        slug: "harsh-dubey" },
  { playerName: "Harshal Patel",      iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 8175,    cricbuzzName: "Harshal Patel",      slug: "harshal-patel" },
  { playerName: "Jaydev Unadkat",     iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 6327,    cricbuzzName: "Jaydev Unadkat",     slug: "jaydev-unadkat" },
  { playerName: "Shivam Mavi",        iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 12345,   cricbuzzName: "Shivam Mavi",        slug: "shivam-mavi" },
  { playerName: "Brydon Carse",       iplTeam: "SRH", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 11436,   cricbuzzName: "Brydon Carse",       slug: "brydon-carse" },
  { playerName: "David Payne",        iplTeam: "SRH", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 6834,    cricbuzzName: "David Payne",        slug: "david-payne" },
  { playerName: "Eshan Malinga",      iplTeam: "SRH", role: "Bowler",       country: "Overseas", basePrice: 0.3, cricbuzzId: 46926,   cricbuzzName: "Eshan Malinga",      slug: "eshan-malinga" },
  { playerName: "Aniket Verma",       iplTeam: "SRH", role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 1447065, cricbuzzName: "Aniket Verma",       slug: "aniket-verma" },
  { playerName: "Smaran Ravichandran",iplTeam: "SRH", role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 29130,   cricbuzzName: "Smaran Ravichandran",slug: "smaran-ravichandran" },
  { playerName: "Salil Arora",        iplTeam: "SRH", role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 15418,   cricbuzzName: "Salil Arora",        slug: "salil-arora" },
  { playerName: "Shivang Kumar",      iplTeam: "SRH", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1455907, cricbuzzName: "Shivang Kumar",      slug: "shivang-kumar" },
  { playerName: "Sakib Hussain",      iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 33129,   cricbuzzName: "Sakib Hussain",      slug: "sakib-hussain" },
  { playerName: "Zeeshan Ansari",     iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 10946,   cricbuzzName: "Zeeshan Ansari",     slug: "zeeshan-ansari" },
  { playerName: "Praful Hinge",       iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1431793, cricbuzzName: "Praful Hinge",       slug: "praful-hinge" },
  { playerName: "Krains Fuletra",     iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1449788, cricbuzzName: "Krains Fuletra",     slug: "krains-fuletra" },
  { playerName: "Amit Kumar",         iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1466014, cricbuzzName: "Amit Kumar",         slug: "amit-kumar" },
  { playerName: "Onkar Tarmale",      iplTeam: "SRH", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1453784, cricbuzzName: "Onkar Tarmale",      slug: "onkar-tarmale" },

  // â”€â”€â”€ MI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Rohit Sharma",       iplTeam: "MI",  role: "Batsman",      country: "India",    basePrice: 2.0, cricbuzzId: 576,     cricbuzzName: "Rohit Sharma",       slug: "rohit-sharma" },
  { playerName: "Suryakumar Yadav",   iplTeam: "MI",  role: "Batsman",      country: "India",    basePrice: 1.5, cricbuzzId: 7915,    cricbuzzName: "Suryakumar Yadav",   slug: "suryakumar-yadav" },
  { playerName: "Hardik Pandya",      iplTeam: "MI",  role: "AllRounder",   country: "India",    basePrice: 1.5, cricbuzzId: 9647,    cricbuzzName: "Hardik Pandya",      slug: "hardik-pandya" },
  { playerName: "Jasprit Bumrah",     iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 2.0, cricbuzzId: 9311,    cricbuzzName: "Jasprit Bumrah",     slug: "jasprit-bumrah" },
  { playerName: "Tilak Varma",        iplTeam: "MI",  role: "Batsman",      country: "India",    basePrice: 1.0, cricbuzzId: 14504,   cricbuzzName: "Tilak Varma",        slug: "tilak-varma" },
  { playerName: "Ryan Rickelton",     iplTeam: "MI",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 13070,   cricbuzzName: "Ryan Rickelton",     slug: "ryan-rickelton" },
  { playerName: "Quinton de Kock",    iplTeam: "MI",  role: "WicketKeeper", country: "Overseas", basePrice: 1.0, cricbuzzId: 8520,    cricbuzzName: "Quinton de Kock",    slug: "quinton-de-kock" },
  { playerName: "Trent Boult",        iplTeam: "MI",  role: "Bowler",       country: "Overseas", basePrice: 1.0, cricbuzzId: 8117,    cricbuzzName: "Trent Boult",        slug: "trent-boult" },
  { playerName: "Sherfane Rutherford",iplTeam: "MI",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 13748,   cricbuzzName: "Sherfane Rutherford",slug: "sherfane-rutherford" },
  { playerName: "Corbin Bosch",       iplTeam: "MI",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 9576,    cricbuzzName: "Corbin Bosch",       slug: "corbin-bosch" },
  { playerName: "Will Jacks",         iplTeam: "MI",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 12258,   cricbuzzName: "Will Jacks",         slug: "will-jacks" },
  { playerName: "AM Ghazanfar",       iplTeam: "MI",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 36501,   cricbuzzName: "AM Ghazanfar",       slug: "am-ghazanfar" },
  { playerName: "Mitchell Santner",   iplTeam: "MI",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 10100,   cricbuzzName: "Mitchell Santner",   slug: "mitchell-santner" },
  { playerName: "Shardul Thakur",     iplTeam: "MI",  role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 8683,    cricbuzzName: "Shardul Thakur",     slug: "shardul-thakur" },
  { playerName: "Deepak Chahar",      iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 7836,    cricbuzzName: "Deepak Chahar",      slug: "deepak-chahar" },
  { playerName: "Mayank Markande",    iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 12627,   cricbuzzName: "Mayank Markande",    slug: "mayank-markande" },
  { playerName: "Ashwani Kumar",      iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 11684,   cricbuzzName: "Ashwani Kumar",      slug: "ashwani-kumar" },
  { playerName: "Raj Bawa",           iplTeam: "MI",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 22601,   cricbuzzName: "Raj Bawa",           slug: "raj-bawa" },
  { playerName: "Robin Minz",         iplTeam: "MI",  role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 36454,   cricbuzzName: "Robin Minz",         slug: "robin-minz" },
  { playerName: "Naman Dhir",         iplTeam: "MI",  role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 36139,   cricbuzzName: "Naman Dhir",         slug: "naman-dhir" },
  { playerName: "Danish Malewar",     iplTeam: "MI",  role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 1431785, cricbuzzName: "Danish Malewar",     slug: "danish-malewar" },
  { playerName: "Mohammed Izhar",     iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1465841, cricbuzzName: "Mohammed Izhar",     slug: "mohammed-salahuddin-izhar" },
  { playerName: "Mayank Rawat",       iplTeam: "MI",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 12341,   cricbuzzName: "Mayank Rawat",       slug: "mayank-rawat" },
  { playerName: "Atharva Ankolekar",  iplTeam: "MI",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 14703,   cricbuzzName: "Atharva Ankolekar",  slug: "atharva-ankolekar" },
  { playerName: "Raghu Sharma",       iplTeam: "MI",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 13146,   cricbuzzName: "Raghu Sharma",       slug: "raghu-sharma" },

  // â”€â”€â”€ KKR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Rinku Singh",        iplTeam: "KKR", role: "Batsman",      country: "India",    basePrice: 1.0, cricbuzzId: 10896,   cricbuzzName: "Rinku Singh",        slug: "rinku-singh" },
  { playerName: "Sunil Narine",       iplTeam: "KKR", role: "AllRounder",   country: "Overseas", basePrice: 1.5, cricbuzzId: 2276,    cricbuzzName: "Sunil Narine",       slug: "sunil-narine" },
  { playerName: "Varun Chakaravarthy",iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 1.0, cricbuzzId: 12926,   cricbuzzName: "Varun Chakaravarthy",slug: "varun-chakaravarthy" },
  { playerName: "Rachin Ravindra",    iplTeam: "KKR", role: "AllRounder",   country: "Overseas", basePrice: 1.0, cricbuzzId: 11177,   cricbuzzName: "Rachin Ravindra",    slug: "rachin-ravindra" },
  { playerName: "Cameron Green",      iplTeam: "KKR", role: "AllRounder",   country: "Overseas", basePrice: 1.0, cricbuzzId: 12225,   cricbuzzName: "Cameron Green",      slug: "cameron-green" },
  { playerName: "Finn Allen",         iplTeam: "KKR", role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 11172,   cricbuzzName: "Finn Allen",         slug: "finn-allen" },
  { playerName: "Rovman Powell",      iplTeam: "KKR", role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 11445,   cricbuzzName: "Rovman Powell",      slug: "rovman-powell" },
  { playerName: "Tim Seifert",        iplTeam: "KKR", role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 9443,    cricbuzzName: "Tim Seifert",        slug: "tim-seifert" },
  { playerName: "Blessing Muzarabani",iplTeam: "KKR", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 13316,   cricbuzzName: "Blessing Muzarabani",slug: "blessing-muzarabani" },
  { playerName: "Ajinkya Rahane",     iplTeam: "KKR", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 1447,    cricbuzzName: "Ajinkya Rahane",     slug: "ajinkya-rahane" },
  { playerName: "Angkrish Raghuvanshi",iplTeam: "KKR",role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 22566,   cricbuzzName: "Angkrish Raghuvanshi",slug: "angkrish-raghuvanshi" },
  { playerName: "Ramandeep Singh",    iplTeam: "KKR", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 12337,   cricbuzzName: "Ramandeep Singh",    slug: "ramandeep-singh" },
  { playerName: "Vaibhav Arora",      iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 15861,   cricbuzzName: "Vaibhav Arora",      slug: "vaibhav-arora" },
  { playerName: "Umran Malik",        iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 19027,   cricbuzzName: "Umran Malik",        slug: "umran-malik" },
  { playerName: "Navdeep Saini",      iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 9715,    cricbuzzName: "Navdeep Saini",      slug: "navdeep-saini" },
  { playerName: "Rahul Tripathi",     iplTeam: "KKR", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 9012,    cricbuzzName: "Rahul Tripathi",     slug: "rahul-tripathi" },
  { playerName: "Manish Pandey",      iplTeam: "KKR", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 1836,    cricbuzzName: "Manish Pandey",      slug: "manish-pandey" },
  { playerName: "Anukul Roy",         iplTeam: "KKR", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 12344,   cricbuzzName: "Anukul Roy",         slug: "anukul-roy" },
  { playerName: "Tejasvi Dahiya",     iplTeam: "KKR", role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 1429684, cricbuzzName: "Tejasvi Dahiya",     slug: "tejasvi-dahiya" },
  { playerName: "Kartik Tyagi",       iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 13136,   cricbuzzName: "Kartik Tyagi",       slug: "kartik-tyagi" },
  { playerName: "Saurabh Dubey",      iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 15766,   cricbuzzName: "Saurabh Dubey",      slug: "saurabh-dubey" },
  { playerName: "Prashant Solanki",   iplTeam: "KKR", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 12805,   cricbuzzName: "Prashant Solanki",   slug: "prashant-solanki" },
  { playerName: "Daksh Kamra",        iplTeam: "KKR", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1467180, cricbuzzName: "Daksh Kamra",        slug: "daksh-kamra" },
  { playerName: "Sarthak Ranjan",     iplTeam: "KKR", role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 11029,   cricbuzzName: "Sarthak Ranjan",     slug: "sarthak-ranjan" },

  // â”€â”€â”€ RR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Yashasvi Jaiswal",   iplTeam: "RR",  role: "Batsman",      country: "India",    basePrice: 2.0, cricbuzzId: 13940,   cricbuzzName: "Yashasvi Jaiswal",   slug: "yashasvi-jaiswal" },
  { playerName: "Ravindra Jadeja",    iplTeam: "RR",  role: "AllRounder",   country: "India",    basePrice: 1.5, cricbuzzId: 587,     cricbuzzName: "Ravindra Jadeja",    slug: "ravindra-jadeja" },
  { playerName: "Riyan Parag",        iplTeam: "RR",  role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 12305,   cricbuzzName: "Riyan Parag",        slug: "riyan-parag" },
  { playerName: "Dhruv Jurel",        iplTeam: "RR",  role: "WicketKeeper", country: "India",    basePrice: 1.0, cricbuzzId: 14691,   cricbuzzName: "Dhruv Jurel",        slug: "dhruv-jurel" },
  { playerName: "Jofra Archer",       iplTeam: "RR",  role: "Bowler",       country: "Overseas", basePrice: 1.0, cricbuzzId: 11540,   cricbuzzName: "Jofra Archer",       slug: "jofra-archer" },
  { playerName: "Shimron Hetmyer",    iplTeam: "RR",  role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 9789,    cricbuzzName: "Shimron Hetmyer",    slug: "shimron-hetmyer" },
  { playerName: "Kwena Maphaka",      iplTeam: "RR",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 23346,   cricbuzzName: "Kwena Maphaka",      slug: "kwena-maphaka" },
  { playerName: "Nandre Burger",      iplTeam: "RR",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 13630,   cricbuzzName: "Nandre Burger",      slug: "nandre-burger" },
  { playerName: "Adam Milne",         iplTeam: "RR",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 7625,    cricbuzzName: "Adam Milne",         slug: "adam-milne" },
  { playerName: "Dasun Shanaka",      iplTeam: "RR",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 8422,    cricbuzzName: "Dasun Shanaka",      slug: "dasun-shanaka" },
  { playerName: "Donovan Ferreira",   iplTeam: "RR",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 14798,   cricbuzzName: "Donovan Ferreira",   slug: "donovan-ferreira" },
  { playerName: "Lhuan-dre Pretorius",iplTeam: "RR",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 50545,   cricbuzzName: "Lhuan-dre Pretorius",slug: "lhuan-dre-pretorius" },
  { playerName: "Ravi Bishnoi",       iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 14659,   cricbuzzName: "Ravi Bishnoi",       slug: "ravi-bishnoi" },
  { playerName: "Sandeep Sharma",     iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 8356,    cricbuzzName: "Sandeep Sharma",     slug: "sandeep-sharma" },
  { playerName: "Tushar Deshpande",   iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 11307,   cricbuzzName: "Tushar Deshpande",   slug: "tushar-deshpande" },
  { playerName: "Vaibhav Sooryavanshi",iplTeam: "RR", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 51791,   cricbuzzName: "Vaibhav Sooryavanshi",slug: "vaibhav-sooryavanshi" },
  { playerName: "Sushant Mishra",     iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 14706,   cricbuzzName: "Sushant Mishra",     slug: "sushant-mishra" },
  { playerName: "Brijesh Sharma",     iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1467167, cricbuzzName: "Brijesh Sharma",     slug: "brijesh-sharma" },
  { playerName: "Ravi Singh",         iplTeam: "RR",  role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 1448413, cricbuzzName: "Ravi Singh",         slug: "ravi-singh" },
  { playerName: "Yudhvir Singh",      iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 15749,   cricbuzzName: "Yudhvir Singh",      slug: "yudhvir-singh-charak" },
  { playerName: "Shubham Dubey",      iplTeam: "RR",  role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 19328,   cricbuzzName: "Shubham Dubey",      slug: "shubham-dubey" },
  { playerName: "Kuldeep Sen",        iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 14336,   cricbuzzName: "Kuldeep Sen",        slug: "kuldeep-sen" },
  { playerName: "Vignesh Puthur",     iplTeam: "RR",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1447337, cricbuzzName: "Vignesh Puthur",     slug: "vignesh-puthur" },
  { playerName: "Aman Rao Perala",    iplTeam: "RR",  role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 1465819, cricbuzzName: "Aman Rao Perala",    slug: "aman-rao-perala" },

  // â”€â”€â”€ CSK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "MS Dhoni",           iplTeam: "CSK", role: "WicketKeeper", country: "India",    basePrice: 2.0, cricbuzzId: 265,     cricbuzzName: "MS Dhoni",           slug: "ms-dhoni" },
  { playerName: "Ruturaj Gaikwad",    iplTeam: "CSK", role: "Batsman",      country: "India",    basePrice: 1.5, cricbuzzId: 11813,   cricbuzzName: "Ruturaj Gaikwad",    slug: "ruturaj-gaikwad" },
  { playerName: "Sanju Samson",       iplTeam: "CSK", role: "WicketKeeper", country: "India",    basePrice: 1.5, cricbuzzId: 8271,    cricbuzzName: "Sanju Samson",       slug: "sanju-samson" },
  { playerName: "Shivam Dube",        iplTeam: "CSK", role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 11195,   cricbuzzName: "Shivam Dube",        slug: "shivam-dube" },
  { playerName: "Sarfaraz Khan",      iplTeam: "CSK", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 9429,    cricbuzzName: "Sarfaraz Khan",      slug: "sarfaraz-khan" },
  { playerName: "Noor Ahmad",         iplTeam: "CSK", role: "Bowler",       country: "Overseas", basePrice: 1.0, cricbuzzId: 15452,   cricbuzzName: "Noor Ahmad",         slug: "noor-ahmad" },
  { playerName: "Matt Henry",         iplTeam: "CSK", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 9067,    cricbuzzName: "Matt Henry",         slug: "matt-henry" },
  { playerName: "Matthew Short",      iplTeam: "CSK", role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 9456,    cricbuzzName: "Matthew Short",      slug: "matthew-short" },
  { playerName: "Jamie Overton",      iplTeam: "CSK", role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 8512,    cricbuzzName: "Jamie Overton",      slug: "jamie-overton" },
  { playerName: "Spencer Johnson",    iplTeam: "CSK", role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 13143,   cricbuzzName: "Spencer Johnson",    slug: "spencer-johnson" },
  { playerName: "Dewald Brevis",      iplTeam: "CSK", role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 20538,   cricbuzzName: "Dewald Brevis",      slug: "dewald-brevis" },
  { playerName: "Zakary Foulkes",     iplTeam: "CSK", role: "AllRounder",   country: "Overseas", basePrice: 0.3, cricbuzzId: 24391,   cricbuzzName: "Zakary Foulkes",     slug: "zakary-foulkes" },
  { playerName: "Akeal Hosein",       iplTeam: "CSK", role: "Bowler",       country: "Overseas", basePrice: 0.3, cricbuzzId: 8435,    cricbuzzName: "Akeal Hosein",       slug: "akeal-hosein" },
  { playerName: "Anshul Kamboj",      iplTeam: "CSK", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 14598,   cricbuzzName: "Anshul Kamboj",      slug: "anshul-kamboj" },
  { playerName: "Khaleel Ahmed",      iplTeam: "CSK", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 10952,   cricbuzzName: "Khaleel Ahmed",      slug: "khaleel-ahmed" },
  { playerName: "Rahul Chahar",       iplTeam: "CSK", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 12087,   cricbuzzName: "Rahul Chahar",       slug: "rahul-chahar" },
  { playerName: "Mukesh Choudhary",   iplTeam: "CSK", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 13184,   cricbuzzName: "Mukesh Choudhary",   slug: "mukesh-choudhary" },
  { playerName: "Ayush Mhatre",       iplTeam: "CSK", role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 1431163, cricbuzzName: "Ayush Mhatre",       slug: "ayush-mhatre" },
  { playerName: "Shreyas Gopal",      iplTeam: "CSK", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 9746,    cricbuzzName: "Shreyas Gopal",      slug: "shreyas-gopal" },
  { playerName: "Kartik Sharma",      iplTeam: "CSK", role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 49557,   cricbuzzName: "Kartik Sharma",      slug: "kartik-sharma" },
  { playerName: "Urvil Patel",        iplTeam: "CSK", role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 13476,   cricbuzzName: "Urvil Patel",        slug: "urvil-patel" },
  { playerName: "Gurjapneet Singh",   iplTeam: "CSK", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 19807,   cricbuzzName: "Gurjapneet Singh",   slug: "gurjapneet-singh" },
  { playerName: "Ramakrishna Ghosh",  iplTeam: "CSK", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 32835,   cricbuzzName: "Ramakrishna Ghosh",  slug: "ramakrishna-ghosh" },
  { playerName: "Prashant Veer",      iplTeam: "CSK", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 51417,   cricbuzzName: "Prashant Veer",      slug: "prashant-veer" },
  { playerName: "Aman Khan",          iplTeam: "CSK", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 19473,   cricbuzzName: "Aman Khan",          slug: "aman-khan" },

  // â”€â”€â”€ PBKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Shreyas Iyer",       iplTeam: "PBKS", role: "Batsman",     country: "India",    basePrice: 1.5, cricbuzzId: 9428,    cricbuzzName: "Shreyas Iyer",       slug: "shreyas-iyer" },
  { playerName: "Arshdeep Singh",     iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 1.5, cricbuzzId: 13217,   cricbuzzName: "Arshdeep Singh",     slug: "arshdeep-singh" },
  { playerName: "Yuzvendra Chahal",   iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 1.0, cricbuzzId: 7910,    cricbuzzName: "Yuzvendra Chahal",   slug: "yuzvendra-chahal" },
  { playerName: "Marcus Stoinis",     iplTeam: "PBKS", role: "AllRounder",  country: "Overseas", basePrice: 1.0, cricbuzzId: 8989,    cricbuzzName: "Marcus Stoinis",     slug: "marcus-stoinis" },
  { playerName: "Marco Jansen",       iplTeam: "PBKS", role: "AllRounder",  country: "Overseas", basePrice: 1.0, cricbuzzId: 14565,   cricbuzzName: "Marco Jansen",       slug: "marco-jansen" },
  { playerName: "Lockie Ferguson",    iplTeam: "PBKS", role: "Bowler",      country: "Overseas", basePrice: 1.0, cricbuzzId: 10692,   cricbuzzName: "Lockie Ferguson",    slug: "lockie-ferguson" },
  { playerName: "Prabhsimran Singh",  iplTeam: "PBKS", role: "WicketKeeper",country: "India",    basePrice: 1.0, cricbuzzId: 14254,   cricbuzzName: "Prabhsimran Singh",  slug: "prabhsimran-singh" },
  { playerName: "Shashank Singh",     iplTeam: "PBKS", role: "AllRounder",  country: "India",    basePrice: 0.5, cricbuzzId: 10919,   cricbuzzName: "Shashank Singh",     slug: "shashank-singh" },
  { playerName: "Musheer Khan",       iplTeam: "PBKS", role: "AllRounder",  country: "India",    basePrice: 0.5, cricbuzzId: 27424,   cricbuzzName: "Musheer Khan",       slug: "musheer-khan" },
  { playerName: "Vijaykumar Vyshak",  iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 0.5, cricbuzzId: 10486,   cricbuzzName: "Vijaykumar Vyshak",  slug: "vijaykumar-vyshak" },
  { playerName: "Priyansh Arya",      iplTeam: "PBKS", role: "Batsman",     country: "India",    basePrice: 0.5, cricbuzzId: 14689,   cricbuzzName: "Priyansh Arya",      slug: "priyansh-arya" },
  { playerName: "Nehal Wadhera",      iplTeam: "PBKS", role: "Batsman",     country: "India",    basePrice: 0.5, cricbuzzId: 13915,   cricbuzzName: "Nehal Wadhera",      slug: "nehal-wadhera" },
  { playerName: "Harpreet Brar",      iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 0.5, cricbuzzId: 14452,   cricbuzzName: "Harpreet Brar",      slug: "harpreet-brar" },
  { playerName: "Yash Thakur",        iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 0.5, cricbuzzId: 12096,   cricbuzzName: "Yash Thakur",        slug: "yash-thakur" },
  { playerName: "Xavier Bartlett",    iplTeam: "PBKS", role: "Bowler",      country: "Overseas", basePrice: 0.5, cricbuzzId: 11689,   cricbuzzName: "Xavier Bartlett",    slug: "xavier-bartlett" },
  { playerName: "Cooper Connolly",    iplTeam: "PBKS", role: "AllRounder",  country: "Overseas", basePrice: 0.5, cricbuzzId: 15927,   cricbuzzName: "Cooper Connolly",    slug: "cooper-connolly" },
  { playerName: "Azmatullah Omarzai", iplTeam: "PBKS", role: "AllRounder",  country: "Overseas", basePrice: 0.5, cricbuzzId: 13214,   cricbuzzName: "Azmatullah Omarzai", slug: "azmatullah-omarzai" },
  { playerName: "Mitchell Owen",      iplTeam: "PBKS", role: "AllRounder",  country: "Overseas", basePrice: 0.5, cricbuzzId: 18568,   cricbuzzName: "Mitchell Owen",      slug: "mitchell-owen" },
  { playerName: "Ben Dwarshuis",      iplTeam: "PBKS", role: "Bowler",      country: "Overseas", basePrice: 0.5, cricbuzzId: 9739,    cricbuzzName: "Ben Dwarshuis",      slug: "ben-dwarshuis" },
  { playerName: "Praveen Dubey",      iplTeam: "PBKS", role: "AllRounder",  country: "India",    basePrice: 0.3, cricbuzzId: 10484,   cricbuzzName: "Praveen Dubey",      slug: "praveen-dubey" },
  { playerName: "Vishnu Vinod",       iplTeam: "PBKS", role: "WicketKeeper",country: "India",    basePrice: 0.3, cricbuzzId: 11893,   cricbuzzName: "Vishnu Vinod",       slug: "vishnu-vinod" },
  { playerName: "Suryansh Shedge",    iplTeam: "PBKS", role: "AllRounder",  country: "India",    basePrice: 0.3, cricbuzzId: 14922,   cricbuzzName: "Suryansh Shedge",    slug: "suryansh-shedge" },
  { playerName: "Harnoor Singh",      iplTeam: "PBKS", role: "Batsman",     country: "India",    basePrice: 0.3, cricbuzzId: 22561,   cricbuzzName: "Harnoor Singh",      slug: "harnoor-singh" },
  { playerName: "Pyla Avinash",       iplTeam: "PBKS", role: "Batsman",     country: "India",    basePrice: 0.3, cricbuzzId: 32525,   cricbuzzName: "Pyla Avinash",       slug: "pyla-avinash" },
  { playerName: "Vishal Nishad",      iplTeam: "PBKS", role: "Bowler",      country: "India",    basePrice: 0.3, cricbuzzId: 1461627, cricbuzzName: "Vishal Nishad",      slug: "vishal-nishad" },

  // â”€â”€â”€ GT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Shubman Gill",       iplTeam: "GT",  role: "Batsman",      country: "India",    basePrice: 2.0, cricbuzzId: 11808,   cricbuzzName: "Shubman Gill",       slug: "shubman-gill" },
  { playerName: "Rashid Khan",        iplTeam: "GT",  role: "AllRounder",   country: "Overseas", basePrice: 1.5, cricbuzzId: 10738,   cricbuzzName: "Rashid Khan",        slug: "rashid-khan" },
  { playerName: "Kagiso Rabada",      iplTeam: "GT",  role: "Bowler",       country: "Overseas", basePrice: 1.5, cricbuzzId: 9585,    cricbuzzName: "Kagiso Rabada",      slug: "kagiso-rabada" },
  { playerName: "Jos Buttler",        iplTeam: "GT",  role: "WicketKeeper", country: "Overseas", basePrice: 1.5, cricbuzzId: 2258,    cricbuzzName: "Jos Buttler",        slug: "jos-buttler" },
  { playerName: "Washington Sundar",  iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 1.0, cricbuzzId: 10945,   cricbuzzName: "Washington Sundar",  slug: "washington-sundar" },
  { playerName: "Mohammed Siraj",     iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 1.0, cricbuzzId: 10808,   cricbuzzName: "Mohammed Siraj",     slug: "mohammed-siraj" },
  { playerName: "Sai Sudharsan",      iplTeam: "GT",  role: "Batsman",      country: "India",    basePrice: 1.0, cricbuzzId: 13866,   cricbuzzName: "Sai Sudharsan",      slug: "sai-sudharsan" },
  { playerName: "Glenn Phillips",     iplTeam: "GT",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 10693,   cricbuzzName: "Glenn Phillips",     slug: "glenn-phillips" },
  { playerName: "Jason Holder",       iplTeam: "GT",  role: "AllRounder",   country: "Overseas", basePrice: 0.5, cricbuzzId: 8313,    cricbuzzName: "Jason Holder",       slug: "jason-holder" },
  { playerName: "Tom Banton",         iplTeam: "GT",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 12254,   cricbuzzName: "Tom Banton",         slug: "tom-banton" },
  { playerName: "Rahul Tewatia",      iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 9693,    cricbuzzName: "Rahul Tewatia",      slug: "rahul-tewatia" },
  { playerName: "Prasidh Krishna",    iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 10551,   cricbuzzName: "Prasidh Krishna",    slug: "prasidh-krishna" },
  { playerName: "Ishant Sharma",      iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 702,     cricbuzzName: "Ishant Sharma",      slug: "ishant-sharma" },
  { playerName: "M Shahrukh Khan",    iplTeam: "GT",  role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 10226,   cricbuzzName: "M Shahrukh Khan",    slug: "m-shahrukh-khan" },
  { playerName: "Sai Kishore",        iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 11595,   cricbuzzName: "Sai Kishore",        slug: "ravisrinivasan-sai-kishore" },
  { playerName: "Jayant Yadav",       iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 8182,    cricbuzzName: "Jayant Yadav",       slug: "jayant-yadav" },
  { playerName: "Luke Wood",          iplTeam: "GT",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 9821,    cricbuzzName: "Luke Wood",          slug: "luke-wood" },
  { playerName: "Manav Suthar",       iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 14596,   cricbuzzName: "Manav Suthar",       slug: "manav-suthar" },
  { playerName: "Kumar Kushagra",     iplTeam: "GT",  role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 15779,   cricbuzzName: "Kumar Kushagra",     slug: "kumar-kushagra" },
  { playerName: "Ashok Sharma",       iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 24261,   cricbuzzName: "Ashok Sharma",       slug: "ashok-sharma" },
  { playerName: "Anuj Rawat",         iplTeam: "GT",  role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 13135,   cricbuzzName: "Anuj Rawat",         slug: "anuj-rawat" },
  { playerName: "Kulwant Khejroliya", iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 12643,   cricbuzzName: "Kulwant Khejroliya", slug: "kulwant-khejroliya" },
  { playerName: "Arshad Khan",        iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 18637,   cricbuzzName: "Arshad Khan",        slug: "arshad-khan" },
  { playerName: "Gurnoor Brar",       iplTeam: "GT",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 22141,   cricbuzzName: "Gurnoor Brar",       slug: "gurnoor-brar" },
  { playerName: "Nishant Sindhu",     iplTeam: "GT",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 22576,   cricbuzzName: "Nishant Sindhu",     slug: "nishant-sindhu" },

  // â”€â”€â”€ LSG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "Rishabh Pant",       iplTeam: "LSG", role: "WicketKeeper", country: "India",    basePrice: 2.0, cricbuzzId: 10744,   cricbuzzName: "Rishabh Pant",       slug: "rishabh-pant" },
  { playerName: "Mohammed Shami",     iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 1.5, cricbuzzId: 7909,    cricbuzzName: "Mohammed Shami",     slug: "mohammed-shami" },
  { playerName: "Mitchell Marsh",     iplTeam: "LSG", role: "AllRounder",   country: "Overseas", basePrice: 1.5, cricbuzzId: 6250,    cricbuzzName: "Mitchell Marsh",     slug: "mitchell-marsh" },
  { playerName: "Nicholas Pooran",    iplTeam: "LSG", role: "WicketKeeper", country: "Overseas", basePrice: 1.0, cricbuzzId: 9406,    cricbuzzName: "Nicholas Pooran",    slug: "nicholas-pooran" },
  { playerName: "Aiden Markram",      iplTeam: "LSG", role: "Batsman",      country: "Overseas", basePrice: 1.0, cricbuzzId: 9582,    cricbuzzName: "Aiden Markram",      slug: "aiden-markram" },
  { playerName: "Anrich Nortje",      iplTeam: "LSG", role: "Bowler",       country: "Overseas", basePrice: 1.0, cricbuzzId: 11427,   cricbuzzName: "Anrich Nortje",      slug: "anrich-nortje" },
  { playerName: "Mayank Yadav",       iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 1.0, cricbuzzId: 22401,   cricbuzzName: "Mayank Yadav",       slug: "mayank-prabhu-yadav" },
  { playerName: "Avesh Khan",         iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 9781,    cricbuzzName: "Avesh Khan",         slug: "avesh-khan" },
  { playerName: "Mohsin Khan",        iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 13534,   cricbuzzName: "Mohsin Khan",        slug: "mohsin-khan" },
  { playerName: "Shahbaz Ahmed",      iplTeam: "LSG", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 14606,   cricbuzzName: "Shahbaz Ahmed",      slug: "shahbaz-ahmed" },
  { playerName: "Ayush Badoni",       iplTeam: "LSG", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 13907,   cricbuzzName: "Ayush Badoni",       slug: "ayush-badoni" },
  { playerName: "Abdul Samad",        iplTeam: "LSG", role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 14628,   cricbuzzName: "Abdul Samad",        slug: "abdul-samad" },
  { playerName: "Josh Inglis",        iplTeam: "LSG", role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 10637,   cricbuzzName: "Josh Inglis",        slug: "josh-inglis" },
  { playerName: "Matthew Breetzke",   iplTeam: "LSG", role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 13089,   cricbuzzName: "Matthew Breetzke",   slug: "matthew-breetzke" },
  { playerName: "Himmat Singh",       iplTeam: "LSG", role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 10223,   cricbuzzName: "Himmat Singh",       slug: "himmat-singh" },
  { playerName: "Akshat Raghuwanshi", iplTeam: "LSG", role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 24431,   cricbuzzName: "Akshat Raghuwanshi", slug: "akshat-raghuwanshi" },
  { playerName: "Mukul Choudhary",    iplTeam: "LSG", role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 39219,   cricbuzzName: "Mukul Choudhary",    slug: "mukul-choudhary" },
  { playerName: "Prince Yadav",       iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 54735,   cricbuzzName: "Prince Yadav",       slug: "prince-yadav" },
  { playerName: "Digvesh Singh Rathi",iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1448289, cricbuzzName: "Digvesh Singh Rathi",slug: "digvesh-singh-rathi" },
  { playerName: "Arshin Kulkarni",    iplTeam: "LSG", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 51378,   cricbuzzName: "Arshin Kulkarni",    slug: "arshin-kulkarni" },
  { playerName: "Arjun Tendulkar",    iplTeam: "LSG", role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 13747,   cricbuzzName: "Arjun Sachin Tendulkar", slug: "arjun-sachin-tendulkar" },
  { playerName: "Naman Tiwari",       iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 51756,   cricbuzzName: "Naman Tiwari",       slug: "naman-tiwari" },
  { playerName: "Manimaran Siddharth",iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 12930,   cricbuzzName: "Manimaran Siddharth",slug: "manimaran-siddharth" },
  { playerName: "Akash Maharaj Singh",iplTeam: "LSG", role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 14696,   cricbuzzName: "Akash Maharaj Singh",slug: "akash-maharaj-singh" },

  // â”€â”€â”€ DC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { playerName: "KL Rahul",           iplTeam: "DC",  role: "WicketKeeper", country: "India",    basePrice: 2.0, cricbuzzId: 8733,    cricbuzzName: "KL Rahul",           slug: "kl-rahul" },
  { playerName: "Axar Patel",         iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 1.5, cricbuzzId: 8808,    cricbuzzName: "Axar Patel",         slug: "axar-patel" },
  { playerName: "Kuldeep Yadav",      iplTeam: "DC",  role: "Bowler",       country: "India",    basePrice: 1.0, cricbuzzId: 8292,    cricbuzzName: "Kuldeep Yadav",      slug: "kuldeep-yadav" },
  { playerName: "David Miller",       iplTeam: "DC",  role: "Batsman",      country: "Overseas", basePrice: 1.0, cricbuzzId: 6349,    cricbuzzName: "David Miller",       slug: "david-miller" },
  { playerName: "Tristan Stubbs",     iplTeam: "DC",  role: "WicketKeeper", country: "Overseas", basePrice: 0.5, cricbuzzId: 19243,   cricbuzzName: "Tristan Stubbs",     slug: "tristan-stubbs" },
  { playerName: "Pathum Nissanka",    iplTeam: "DC",  role: "Batsman",      country: "Overseas", basePrice: 0.5, cricbuzzId: 13682,   cricbuzzName: "Pathum Nissanka",    slug: "pathum-nissanka" },
  { playerName: "Lungi Ngidi",        iplTeam: "DC",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 9603,    cricbuzzName: "Lungi Ngidi",        slug: "lungi-ngidi" },
  { playerName: "Dushmantha Chameera",iplTeam: "DC",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 8393,    cricbuzzName: "Dushmantha Chameera",slug: "dushmantha-chameera" },
  { playerName: "Kyle Jamieson",      iplTeam: "DC",  role: "Bowler",       country: "Overseas", basePrice: 0.5, cricbuzzId: 9441,    cricbuzzName: "Kyle Jamieson",      slug: "kyle-jamieson" },
  { playerName: "Nitish Rana",        iplTeam: "DC",  role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 9204,    cricbuzzName: "Nitish Rana",        slug: "nitish-rana" },
  { playerName: "T Natarajan",        iplTeam: "DC",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 10225,   cricbuzzName: "T Natarajan",        slug: "t-natarajan" },
  { playerName: "Mukesh Kumar",       iplTeam: "DC",  role: "Bowler",       country: "India",    basePrice: 0.5, cricbuzzId: 10754,   cricbuzzName: "Mukesh Kumar",       slug: "mukesh-kumar" },
  { playerName: "Karun Nair",         iplTeam: "DC",  role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 8257,    cricbuzzName: "Karun Nair",         slug: "karun-nair" },
  { playerName: "Prithvi Shaw",       iplTeam: "DC",  role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 12094,   cricbuzzName: "Prithvi Shaw",       slug: "prithvi-shaw" },
  { playerName: "Sameer Rizvi",       iplTeam: "DC",  role: "Batsman",      country: "India",    basePrice: 0.5, cricbuzzId: 14700,   cricbuzzName: "Sameer Rizvi",       slug: "sameer-rizvi" },
  { playerName: "Ashutosh Sharma",    iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 0.5, cricbuzzId: 13497,   cricbuzzName: "Ashutosh Sharma",    slug: "ashutosh-sharma" },
  { playerName: "Abishek Porel",      iplTeam: "DC",  role: "WicketKeeper", country: "India",    basePrice: 0.3, cricbuzzId: 24326,   cricbuzzName: "Abishek Porel",      slug: "abishek-porel" },
  { playerName: "Vipraj Nigam",       iplTeam: "DC",  role: "Bowler",       country: "India",    basePrice: 0.3, cricbuzzId: 1431811, cricbuzzName: "Vipraj Nigam",       slug: "vipraj-nigam" },
  { playerName: "Auqib Nabi",         iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 14179,   cricbuzzName: "Auqib Nabi",         slug: "auqib-nabi-dar" },
  { playerName: "Sahil Parakh",       iplTeam: "DC",  role: "Batsman",      country: "India",    basePrice: 0.3, cricbuzzId: 1430465, cricbuzzName: "Sahil Parakh",       slug: "sahil-parakh" },
  { playerName: "Madhav Tiwari",      iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 1447321, cricbuzzName: "Madhav Tiwari",      slug: "madhav-tiwari" },
  { playerName: "Tripurana Vijay",    iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 22386,   cricbuzzName: "Tripurana Vijay",    slug: "tripurana-vijay" },
  { playerName: "Ajay Mandal",        iplTeam: "DC",  role: "AllRounder",   country: "India",    basePrice: 0.3, cricbuzzId: 11777,   cricbuzzName: "Ajay Mandal",        slug: "ajay-jadav-mandal" },

];

// Total: 242 players across 10 teams

/**
 * Seed IPL 2026 players into the playerPool collection.
 * Drops and rebuilds the collection for a clean state.
 * @param {import('mongodb').Db} db
 */
async function seedPlayers(db) {
  const collection = db.collection('playerPool');
  const now = new Date();

  // Drop all existing players for a clean rebuild
  const deleted = await collection.deleteMany({});
  console.log(`  ðŸ—‘ï¸  Cleared ${deleted.deletedCount} existing players from playerPool`);

  const docs = players.map(p => ({
    playerName:   p.playerName,
    cricbuzzName: p.cricbuzzName,
    iplTeam:      p.iplTeam,
    role:         p.role,
    country:      p.country,
    basePrice:    p.basePrice,
    cricbuzzId:   p.cricbuzzId,
    slug:         p.slug,
    status:       'available',
    soldPrice:    null,
    soldToTeamId:   null,
    soldToTeamName: null,
    soldInRoomId:   null,
    soldAt:         null,
    createdAt:    now,
    updatedAt:    now,
  }));

  await collection.insertMany(docs);
  console.log(`âœ… playerPool: ${docs.length} players inserted (${[...new Set(players.map(p => p.iplTeam))].length} teams)`);

  // Print summary by team
  const byTeam = {};
  for (const p of players) byTeam[p.iplTeam] = (byTeam[p.iplTeam] || 0) + 1;
  for (const [team, count] of Object.entries(byTeam)) {
    console.log(`   ${team.padEnd(5)} ${count} players`);
  }
}

module.exports = { seedPlayers, players };
