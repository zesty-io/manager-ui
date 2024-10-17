import moment from "moment";

const TIME_STRINGS = [
  "12:00 am",
  "12:15 am",
  "12:30 am",
  "12:45 am",
  "1:00 am",
  "1:15 am",
  "1:30 am",
  "1:45 am",
  "2:00 am",
  "2:15 am",
  "2:30 am",
  "2:45 am",
  "3:00 am",
  "3:15 am",
  "3:30 am",
  "3:45 am",
  "4:00 am",
  "4:15 am",
  "4:30 am",
  "4:45 am",
  "5:00 am",
  "5:15 am",
  "5:30 am",
  "5:45 am",
  "6:00 am",
  "6:15 am",
  "6:30 am",
  "6:45 am",
  "7:00 am",
  "7:15 am",
  "7:30 am",
  "7:45 am",
  "8:00 am",
  "8:15 am",
  "8:30 am",
  "8:45 am",
  "9:00 am",
  "9:15 am",
  "9:30 am",
  "9:45 am",
  "10:00 am",
  "10:15 am",
  "10:30 am",
  "10:45 am",
  "11:00 am",
  "11:15 am",
  "11:30 am",
  "11:45 am",
  "12:00 pm",
  "12:15 pm",
  "12:30 pm",
  "12:45 pm",
  "1:00 pm",
  "1:15 pm",
  "1:30 pm",
  "1:45 pm",
  "2:00 pm",
  "2:15 pm",
  "2:30 pm",
  "2:45 pm",
  "3:00 pm",
  "3:15 pm",
  "3:30 pm",
  "3:45 pm",
  "4:00 pm",
  "4:15 pm",
  "4:30 pm",
  "4:45 pm",
  "5:00 pm",
  "5:15 pm",
  "5:30 pm",
  "5:45 pm",
  "6:00 pm",
  "6:15 pm",
  "6:30 pm",
  "6:45 pm",
  "7:00 pm",
  "7:15 pm",
  "7:30 pm",
  "7:45 pm",
  "8:00 pm",
  "8:15 pm",
  "8:30 pm",
  "8:45 pm",
  "9:00 pm",
  "9:15 pm",
  "9:30 pm",
  "9:45 pm",
  "10:00 pm",
  "10:15 pm",
  "10:30 pm",
  "10:45 pm",
  "11:00 pm",
  "11:15 pm",
  "11:30 pm",
  "11:45 pm",
] as const;
export const TIMEZONES = [
  {
    label: "(GMT+00:00) Coordinated Universal Time",
    id: "UTC",
  },
  {
    label: "(GMT-11:00) Niue Time",
    id: "Pacific/Niue",
  },
  {
    label: "(GMT-11:00) Samoa Standard Time",
    id: "Pacific/Pago_Pago",
  },
  {
    label: "(GMT-10:00) Cook Islands Standard Time",
    id: "Pacific/Rarotonga",
  },
  {
    label: "(GMT-10:00) Hawaii-Aleutian Standard Time",
    id: "Pacific/Honolulu",
  },
  {
    label: "(GMT-10:00) Hawaii-Aleutian Time",
    id: "America/Adak",
  },
  {
    label: "(GMT-10:00) Tahiti Time",
    id: "Pacific/Tahiti",
  },
  {
    label: "(GMT-09:30) Marquesas Time",
    id: "Pacific/Marquesas",
  },
  {
    label: "(GMT-09:00) Alaska Time - Anchorage",
    id: "America/Anchorage",
  },
  {
    label: "(GMT-09:00) Alaska Time - Juneau",
    id: "America/Juneau",
  },
  {
    label: "(GMT-09:00) Alaska Time - Metlakatla",
    id: "America/Metlakatla",
  },
  {
    label: "(GMT-09:00) Alaska Time - Nome",
    id: "America/Nome",
  },
  {
    label: "(GMT-09:00) Alaska Time - Sitka",
    id: "America/Sitka",
  },
  {
    label: "(GMT-09:00) Alaska Time - Yakutat",
    id: "America/Yakutat",
  },
  {
    label: "(GMT-09:00) Gambier Time",
    id: "Pacific/Gambier",
  },
  {
    label: "(GMT-08:00) Pacific Time - Los Angeles",
    id: "America/Los_Angeles",
  },
  {
    label: "(GMT-08:00) Pacific Time - Tijuana",
    id: "America/Tijuana",
  },
  {
    label: "(GMT-08:00) Pacific Time - Vancouver",
    id: "America/Vancouver",
  },
  {
    label: "(GMT-08:00) Pitcairn Time",
    id: "Pacific/Pitcairn",
  },
  {
    label: "(GMT-07:00) Mexican Pacific Standard Time - Hermosillo",
    id: "America/Hermosillo",
  },
  {
    label: "(GMT-07:00) Mexican Pacific Standard Time - Mazatlan",
    id: "America/Mazatlan",
  },
  {
    label: "(GMT-07:00) Mountain Standard Time - Dawson Creek",
    id: "America/Dawson_Creek",
  },
  {
    label: "(GMT-07:00) Mountain Standard Time - Fort Nelson",
    id: "America/Fort_Nelson",
  },
  {
    label: "(GMT-07:00) Mountain Standard Time - Phoenix",
    id: "America/Phoenix",
  },
  {
    label: "(GMT-07:00) Mountain Time - Boise",
    id: "America/Boise",
  },
  {
    label: "(GMT-07:00) Mountain Time - Cambridge Bay",
    id: "America/Cambridge_Bay",
  },
  {
    label: "(GMT-07:00) Mountain Time - Ciudad Juárez",
    id: "America/Ciudad_Juarez",
  },
  {
    label: "(GMT-07:00) Mountain Time - Denver",
    id: "America/Denver",
  },
  {
    label: "(GMT-07:00) Mountain Time - Edmonton",
    id: "America/Edmonton",
  },
  {
    label: "(GMT-07:00) Mountain Time - Edmonton",
    id: "America/Yellowknife",
  },
  {
    label: "(GMT-07:00) Mountain Time - Inuvik",
    id: "America/Inuvik",
  },
  {
    label: "(GMT-07:00) Yukon Time - Dawson",
    id: "America/Dawson",
  },
  {
    label: "(GMT-07:00) Yukon Time - Whitehorse",
    id: "America/Whitehorse",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Bahía de Banderas",
    id: "America/Bahia_Banderas",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Belize",
    id: "America/Belize",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Chihuahua",
    id: "America/Chihuahua",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Costa Rica",
    id: "America/Costa_Rica",
  },
  {
    label: "(GMT-06:00) Central Standard Time - El Salvador",
    id: "America/El_Salvador",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Guatemala",
    id: "America/Guatemala",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Managua",
    id: "America/Managua",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Mérida",
    id: "America/Merida",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Mexico City",
    id: "America/Mexico_City",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Monterrey",
    id: "America/Monterrey",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Regina",
    id: "America/Regina",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Swift Current",
    id: "America/Swift_Current",
  },
  {
    label: "(GMT-06:00) Central Standard Time - Tegucigalpa",
    id: "America/Tegucigalpa",
  },
  {
    label: "(GMT-06:00) Central Time - Beulah, North Dakota",
    id: "America/North_Dakota/Beulah",
  },
  {
    label: "(GMT-06:00) Central Time - Center, North Dakota",
    id: "America/North_Dakota/Center",
  },
  {
    label: "(GMT-06:00) Central Time - Chicago",
    id: "America/Chicago",
  },
  {
    label: "(GMT-06:00) Central Time - Knox, Indiana",
    id: "America/Indiana/Knox",
  },
  {
    label: "(GMT-06:00) Central Time - Matamoros",
    id: "America/Matamoros",
  },
  {
    label: "(GMT-06:00) Central Time - Menominee",
    id: "America/Menominee",
  },
  {
    label: "(GMT-06:00) Central Time - New Salem, North Dakota",
    id: "America/North_Dakota/New_Salem",
  },
  {
    label: "(GMT-06:00) Central Time - Ojinaga",
    id: "America/Ojinaga",
  },
  {
    label: "(GMT-06:00) Central Time - Rankin Inlet",
    id: "America/Rankin_Inlet",
  },
  {
    label: "(GMT-06:00) Central Time - Resolute",
    id: "America/Resolute",
  },
  {
    label: "(GMT-06:00) Central Time - Tell City, Indiana",
    id: "America/Indiana/Tell_City",
  },
  {
    label: "(GMT-06:00) Central Time - Winnipeg",
    id: "America/Rainy_River",
  },
  {
    label: "(GMT-06:00) Central Time - Winnipeg",
    id: "America/Winnipeg",
  },
  {
    label: "(GMT-06:00) Galapagos Time",
    id: "Pacific/Galapagos",
  },
  {
    label: "(GMT-05:00) Acre Standard Time - Eirunepe",
    id: "America/Eirunepe",
  },
  {
    label: "(GMT-05:00) Acre Standard Time - Rio Branco",
    id: "America/Rio_Branco",
  },
  {
    label: "(GMT-05:00) Colombia Standard Time",
    id: "America/Bogota",
  },
  {
    label: "(GMT-05:00) Cuba Time",
    id: "America/Havana",
  },
  {
    label: "(GMT-05:00) Easter Island Time",
    id: "Pacific/Easter",
  },
  {
    label: "(GMT-05:00) Eastern Standard Time - Cancún",
    id: "America/Cancun",
  },
  {
    label: "(GMT-05:00) Eastern Standard Time - Jamaica",
    id: "America/Jamaica",
  },
  {
    label: "(GMT-05:00) Eastern Standard Time - Panama",
    id: "America/Panama",
  },
  {
    label: "(GMT-05:00) Eastern Time - Detroit",
    id: "America/Detroit",
  },
  {
    label: "(GMT-05:00) Eastern Time - Grand Turk",
    id: "America/Grand_Turk",
  },
  {
    label: "(GMT-05:00) Eastern Time - Indianapolis",
    id: "America/Indiana/Indianapolis",
  },
  {
    label: "(GMT-05:00) Eastern Time - Iqaluit",
    id: "America/Iqaluit",
  },
  {
    label: "(GMT-05:00) Eastern Time - Iqaluit",
    id: "America/Pangnirtung",
  },
  {
    label: "(GMT-05:00) Eastern Time - Louisville",
    id: "America/Kentucky/Louisville",
  },
  {
    label: "(GMT-05:00) Eastern Time - Marengo, Indiana",
    id: "America/Indiana/Marengo",
  },
  {
    label: "(GMT-05:00) Eastern Time - Monticello, Kentucky",
    id: "America/Kentucky/Monticello",
  },
  {
    label: "(GMT-05:00) Eastern Time - New York",
    id: "America/New_York",
  },
  {
    label: "(GMT-05:00) Eastern Time - Petersburg, Indiana",
    id: "America/Indiana/Petersburg",
  },
  {
    label: "(GMT-05:00) Eastern Time - Port-au-Prince",
    id: "America/Port-au-Prince",
  },
  {
    label: "(GMT-05:00) Eastern Time - Toronto",
    id: "America/Nipigon",
  },
  {
    label: "(GMT-05:00) Eastern Time - Toronto",
    id: "America/Thunder_Bay",
  },
  {
    label: "(GMT-05:00) Eastern Time - Toronto",
    id: "America/Toronto",
  },
  {
    label: "(GMT-05:00) Eastern Time - Vevay, Indiana",
    id: "America/Indiana/Vevay",
  },
  {
    label: "(GMT-05:00) Eastern Time - Vincennes, Indiana",
    id: "America/Indiana/Vincennes",
  },
  {
    label: "(GMT-05:00) Eastern Time - Winamac, Indiana",
    id: "America/Indiana/Winamac",
  },
  {
    label: "(GMT-05:00) Ecuador Time",
    id: "America/Guayaquil",
  },
  {
    label: "(GMT-05:00) Peru Standard Time",
    id: "America/Lima",
  },
  {
    label: "(GMT-04:00) Amazon Standard Time - Boa Vista",
    id: "America/Boa_Vista",
  },
  {
    label: "(GMT-04:00) Amazon Standard Time - Campo Grande",
    id: "America/Campo_Grande",
  },
  {
    label: "(GMT-04:00) Amazon Standard Time - Cuiaba",
    id: "America/Cuiaba",
  },
  {
    label: "(GMT-04:00) Amazon Standard Time - Manaus",
    id: "America/Manaus",
  },
  {
    label: "(GMT-04:00) Amazon Standard Time - Porto Velho",
    id: "America/Porto_Velho",
  },
  {
    label: "(GMT-04:00) Atlantic Standard Time - Barbados",
    id: "America/Barbados",
  },
  {
    label: "(GMT-04:00) Atlantic Standard Time - Martinique",
    id: "America/Martinique",
  },
  {
    label: "(GMT-04:00) Atlantic Standard Time - Puerto Rico",
    id: "America/Puerto_Rico",
  },
  {
    label: "(GMT-04:00) Atlantic Standard Time - Santo Domingo",
    id: "America/Santo_Domingo",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Bermuda",
    id: "Atlantic/Bermuda",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Glace Bay",
    id: "America/Glace_Bay",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Goose Bay",
    id: "America/Goose_Bay",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Halifax",
    id: "America/Halifax",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Moncton",
    id: "America/Moncton",
  },
  {
    label: "(GMT-04:00) Atlantic Time - Thule",
    id: "America/Thule",
  },
  {
    label: "(GMT-04:00) Bolivia Time",
    id: "America/La_Paz",
  },
  {
    label: "(GMT-04:00) Guyana Time",
    id: "America/Guyana",
  },
  {
    label: "(GMT-04:00) Venezuela Time",
    id: "America/Caracas",
  },
  {
    label: "(GMT-03:30) Newfoundland Time",
    id: "America/St_Johns",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Buenos Aires",
    id: "America/Argentina/Buenos_Aires",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Catamarca",
    id: "America/Argentina/Catamarca",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Cordoba",
    id: "America/Argentina/Cordoba",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Jujuy",
    id: "America/Argentina/Jujuy",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - La Rioja",
    id: "America/Argentina/La_Rioja",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Mendoza",
    id: "America/Argentina/Mendoza",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Rio Gallegos",
    id: "America/Argentina/Rio_Gallegos",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Salta",
    id: "America/Argentina/Salta",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - San Juan",
    id: "America/Argentina/San_Juan",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - San Luis",
    id: "America/Argentina/San_Luis",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Tucuman",
    id: "America/Argentina/Tucuman",
  },
  {
    label: "(GMT-03:00) Argentina Standard Time - Ushuaia",
    id: "America/Argentina/Ushuaia",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Araguaina",
    id: "America/Araguaina",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Bahia",
    id: "America/Bahia",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Belem",
    id: "America/Belem",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Fortaleza",
    id: "America/Fortaleza",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Maceio",
    id: "America/Maceio",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Recife",
    id: "America/Recife",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Santarem",
    id: "America/Santarem",
  },
  {
    label: "(GMT-03:00) Brasilia Standard Time - Sao Paulo",
    id: "America/Sao_Paulo",
  },
  {
    label: "(GMT-03:00) Chile Time",
    id: "America/Santiago",
  },
  {
    label: "(GMT-03:00) Falkland Islands Standard Time",
    id: "Atlantic/Stanley",
  },
  {
    label: "(GMT-03:00) French Guiana Time",
    id: "America/Cayenne",
  },
  {
    label: "(GMT-03:00) Palmer Time",
    id: "Antarctica/Palmer",
  },
  {
    label: "(GMT-03:00) Paraguay Time",
    id: "America/Asuncion",
  },
  {
    label: "(GMT-03:00) Punta Arenas Time",
    id: "America/Punta_Arenas",
  },
  {
    label: "(GMT-03:00) Rothera Time",
    id: "Antarctica/Rothera",
  },
  {
    label: "(GMT-03:00) St. Pierre & Miquelon Time",
    id: "America/Miquelon",
  },
  {
    label: "(GMT-03:00) Surilabel Time",
    id: "America/Paramaribo",
  },
  {
    label: "(GMT-03:00) Uruguay Standard Time",
    id: "America/Montevideo",
  },
  {
    label: "(GMT-02:00) Fernando de Noronha Standard Time",
    id: "America/Noronha",
  },
  {
    label: "(GMT-02:00) South Georgia Time",
    id: "Atlantic/South_Georgia",
  },
  {
    label: "(GMT-02:00) West Greenland Time",
    id: "America/Nuuk",
  },
  {
    label: "(GMT-01:00) Azores Time",
    id: "Atlantic/Azores",
  },
  {
    label: "(GMT-01:00) Cape Verde Standard Time",
    id: "Atlantic/Cape_Verde",
  },
  {
    label: "(GMT-01:00) East Greenland Time",
    id: "America/Scoresbysund",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time",
    id: "Etc/GMT",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - Abidjan",
    id: "Africa/Abidjan",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - Bissau",
    id: "Africa/Bissau",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - Danmarkshavn",
    id: "America/Danmarkshavn",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - Monrovia",
    id: "Africa/Monrovia",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - Reykjavik",
    id: "Atlantic/Reykjavik",
  },
  {
    label: "(GMT+00:00) Greenwich Mean Time - São Tomé",
    id: "Africa/Sao_Tome",
  },
  {
    label: "(GMT+00:00) Ireland Time",
    id: "Europe/Dublin",
  },
  {
    label: "(GMT+00:00) Troll Time",
    id: "Antarctica/Troll",
  },
  {
    label: "(GMT+00:00) United Kingdom Time",
    id: "Europe/London",
  },
  {
    label: "(GMT+00:00) Western European Time - Canary",
    id: "Atlantic/Canary",
  },
  {
    label: "(GMT+00:00) Western European Time - Faroe",
    id: "Atlantic/Faroe",
  },
  {
    label: "(GMT+00:00) Western European Time - Lisbon",
    id: "Europe/Lisbon",
  },
  {
    label: "(GMT+00:00) Western European Time - Madeira",
    id: "Atlantic/Madeira",
  },
  {
    label: "(GMT+01:00) Central European Standard Time - Algiers",
    id: "Africa/Algiers",
  },
  {
    label: "(GMT+01:00) Central European Standard Time - Tunis",
    id: "Africa/Tunis",
  },
  {
    label: "(GMT+01:00) Central European Time - Amsterdam",
    id: "Europe/Amsterdam",
  },
  {
    label: "(GMT+01:00) Central European Time - Andorra",
    id: "Europe/Andorra",
  },
  {
    label: "(GMT+01:00) Central European Time - Belgrade",
    id: "Europe/Belgrade",
  },
  {
    label: "(GMT+01:00) Central European Time - Berlin",
    id: "Europe/Berlin",
  },
  {
    label: "(GMT+01:00) Central European Time - Brussels",
    id: "Europe/Brussels",
  },
  {
    label: "(GMT+01:00) Central European Time - Budapest",
    id: "Europe/Budapest",
  },
  {
    label: "(GMT+01:00) Central European Time - Ceuta",
    id: "Africa/Ceuta",
  },
  {
    label: "(GMT+01:00) Central European Time - Copenhagen",
    id: "Europe/Copenhagen",
  },
  {
    label: "(GMT+01:00) Central European Time - Gibraltar",
    id: "Europe/Gibraltar",
  },
  {
    label: "(GMT+01:00) Central European Time - Luxembourg",
    id: "Europe/Luxembourg",
  },
  {
    label: "(GMT+01:00) Central European Time - Madrid",
    id: "Europe/Madrid",
  },
  {
    label: "(GMT+01:00) Central European Time - Malta",
    id: "Europe/Malta",
  },
  {
    label: "(GMT+01:00) Central European Time - Monaco",
    id: "Europe/Monaco",
  },
  {
    label: "(GMT+01:00) Central European Time - Oslo",
    id: "Europe/Oslo",
  },
  {
    label: "(GMT+01:00) Central European Time - Paris",
    id: "Europe/Paris",
  },
  {
    label: "(GMT+01:00) Central European Time - Prague",
    id: "Europe/Prague",
  },
  {
    label: "(GMT+01:00) Central European Time - Rome",
    id: "Europe/Rome",
  },
  {
    label: "(GMT+01:00) Central European Time - Stockholm",
    id: "Europe/Stockholm",
  },
  {
    label: "(GMT+01:00) Central European Time - Tirane",
    id: "Europe/Tirane",
  },
  {
    label: "(GMT+01:00) Central European Time - Vienna",
    id: "Europe/Vienna",
  },
  {
    label: "(GMT+01:00) Central European Time - Warsaw",
    id: "Europe/Warsaw",
  },
  {
    label: "(GMT+01:00) Central European Time - Zurich",
    id: "Europe/Zurich",
  },
  {
    label: "(GMT+01:00) Morocco Time",
    id: "Africa/Casablanca",
  },
  {
    label: "(GMT+01:00) West Africa Standard Time - Lagos",
    id: "Africa/Lagos",
  },
  {
    label: "(GMT+01:00) West Africa Standard Time - Ndjamena",
    id: "Africa/Ndjamena",
  },
  {
    label: "(GMT+01:00) Western Sahara Time",
    id: "Africa/El_Aaiun",
  },
  {
    label: "(GMT+02:00) Central Africa Time - Juba",
    id: "Africa/Juba",
  },
  {
    label: "(GMT+02:00) Central Africa Time - Khartoum",
    id: "Africa/Khartoum",
  },
  {
    label: "(GMT+02:00) Central Africa Time - Maputo",
    id: "Africa/Maputo",
  },
  {
    label: "(GMT+02:00) Central Africa Time - Windhoek",
    id: "Africa/Windhoek",
  },
  {
    label: "(GMT+02:00) Eastern European Standard Time - Kaliningrad",
    id: "Europe/Kaliningrad",
  },
  {
    label: "(GMT+02:00) Eastern European Standard Time - Tripoli",
    id: "Africa/Tripoli",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Athens",
    id: "Europe/Athens",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Beirut",
    id: "Asia/Beirut",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Bucharest",
    id: "Europe/Bucharest",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Cairo",
    id: "Africa/Cairo",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Chisinau",
    id: "Europe/Chisinau",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Gaza",
    id: "Asia/Gaza",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Hebron",
    id: "Asia/Hebron",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Helsinki",
    id: "Europe/Helsinki",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Kyiv",
    id: "Europe/Kiev",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Kyiv",
    id: "Europe/Uzhgorod",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Kyiv",
    id: "Europe/Zaporozhye",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Nicosia",
    id: "Asia/Nicosia",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Riga",
    id: "Europe/Riga",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Sofia",
    id: "Europe/Sofia",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Tallinn",
    id: "Europe/Tallinn",
  },
  {
    label: "(GMT+02:00) Eastern European Time - Vilnius",
    id: "Europe/Vilnius",
  },
  {
    label: "(GMT+02:00) Famagusta Time",
    id: "Asia/Famagusta",
  },
  {
    label: "(GMT+02:00) Israel Time",
    id: "Asia/Jerusalem",
  },
  {
    label: "(GMT+02:00) South Africa Standard Time",
    id: "Africa/Johannesburg",
  },
  {
    label: "(GMT+03:00) Arabian Standard Time - Baghdad",
    id: "Asia/Baghdad",
  },
  {
    label: "(GMT+03:00) Arabian Standard Time - Qatar",
    id: "Asia/Qatar",
  },
  {
    label: "(GMT+03:00) Arabian Standard Time - Riyadh",
    id: "Asia/Riyadh",
  },
  {
    label: "(GMT+03:00) East Africa Time",
    id: "Africa/Nairobi",
  },
  {
    label: "(GMT+03:00) Jordan Time",
    id: "Asia/Amman",
  },
  {
    label: "(GMT+03:00) Kirov Time",
    id: "Europe/Kirov",
  },
  {
    label: "(GMT+03:00) Moscow Standard Time - Minsk",
    id: "Europe/Minsk",
  },
  {
    label: "(GMT+03:00) Moscow Standard Time - Moscow",
    id: "Europe/Moscow",
  },
  {
    label: "(GMT+03:00) Moscow Standard Time - Simferopol",
    id: "Europe/Simferopol",
  },
  {
    label: "(GMT+03:00) Syria Time",
    id: "Asia/Damascus",
  },
  {
    label: "(GMT+03:00) Türkiye Time",
    id: "Europe/Istanbul",
  },
  {
    label: "(GMT+03:00) Volgograd Standard Time",
    id: "Europe/Volgograd",
  },
  {
    label: "(GMT+03:30) Iran Standard Time",
    id: "Asia/Tehran",
  },
  {
    label: "(GMT+04:00) Armenia Standard Time",
    id: "Asia/Yerevan",
  },
  {
    label: "(GMT+04:00) Astrakhan Time",
    id: "Europe/Astrakhan",
  },
  {
    label: "(GMT+04:00) Azerbaijan Standard Time",
    id: "Asia/Baku",
  },
  {
    label: "(GMT+04:00) Georgia Standard Time",
    id: "Asia/Tbilisi",
  },
  {
    label: "(GMT+04:00) Gulf Standard Time",
    id: "Asia/Dubai",
  },
  {
    label: "(GMT+04:00) Mauritius Standard Time",
    id: "Indian/Mauritius",
  },
  {
    label: "(GMT+04:00) Réunion Time",
    id: "Indian/Reunion",
  },
  {
    label: "(GMT+04:00) Samara Standard Time",
    id: "Europe/Samara",
  },
  {
    label: "(GMT+04:00) Saratov Time",
    id: "Europe/Saratov",
  },
  {
    label: "(GMT+04:00) Seychelles Time",
    id: "Indian/Mahe",
  },
  {
    label: "(GMT+04:00) Ulyanovsk Time",
    id: "Europe/Ulyanovsk",
  },
  {
    label: "(GMT+04:30) Afghanistan Time",
    id: "Asia/Kabul",
  },
  {
    label: "(GMT+05:00) French Southern & Antarctic Time",
    id: "Indian/Kerguelen",
  },
  {
    label: "(GMT+05:00) Maldives Time",
    id: "Indian/Maldives",
  },
  {
    label: "(GMT+05:00) Mawson Time",
    id: "Antarctica/Mawson",
  },
  {
    label: "(GMT+05:00) Pakistan Standard Time",
    id: "Asia/Karachi",
  },
  {
    label: "(GMT+05:00) Tajikistan Time",
    id: "Asia/Dushanbe",
  },
  {
    label: "(GMT+05:00) Turkmenistan Standard Time",
    id: "Asia/Ashgabat",
  },
  {
    label: "(GMT+05:00) Uzbekistan Standard Time - Samarkand",
    id: "Asia/Samarkand",
  },
  {
    label: "(GMT+05:00) Uzbekistan Standard Time - Tashkent",
    id: "Asia/Tashkent",
  },
  {
    label: "(GMT+05:00) West Kazakhstan Time - Aqtau",
    id: "Asia/Aqtau",
  },
  {
    label: "(GMT+05:00) West Kazakhstan Time - Aqtobe",
    id: "Asia/Aqtobe",
  },
  {
    label: "(GMT+05:00) West Kazakhstan Time - Atyrau",
    id: "Asia/Atyrau",
  },
  {
    label: "(GMT+05:00) West Kazakhstan Time - Oral",
    id: "Asia/Oral",
  },
  {
    label: "(GMT+05:00) West Kazakhstan Time - Qyzylorda",
    id: "Asia/Qyzylorda",
  },
  {
    label: "(GMT+05:00) Yekaterinburg Standard Time",
    id: "Asia/Yekaterinburg",
  },
  {
    label: "(GMT+05:30) India Standard Time - Colombo",
    id: "Asia/Colombo",
  },
  {
    label: "(GMT+05:30) India Standard Time - Calcutta",
    id: "Asia/Calcutta",
  },
  {
    label: "(GMT+05:30) India Standard Time - Kolkata",
    id: "Asia/Kolkata",
  },
  {
    label: "(GMT+05:45) Nepal Time",
    id: "Asia/Kathmandu",
  },
  {
    label: "(GMT+06:00) Bangladesh Standard Time",
    id: "Asia/Dhaka",
  },
  {
    label: "(GMT+06:00) Bhutan Time",
    id: "Asia/Thimphu",
  },
  {
    label: "(GMT+06:00) East Kazakhstan Time - Almaty",
    id: "Asia/Almaty",
  },
  {
    label: "(GMT+06:00) East Kazakhstan Time - Kostanay",
    id: "Asia/Qostanay",
  },
  {
    label: "(GMT+06:00) Indian Ocean Time",
    id: "Indian/Chagos",
  },
  {
    label: "(GMT+06:00) Kyrgyzstan Time",
    id: "Asia/Bishkek",
  },
  {
    label: "(GMT+06:00) Omsk Standard Time",
    id: "Asia/Omsk",
  },
  {
    label: "(GMT+06:00) Urumqi Time",
    id: "Asia/Urumqi",
  },
  {
    label: "(GMT+06:00) Vostok Time",
    id: "Antarctica/Vostok",
  },
  {
    label: "(GMT+06:30) Cocos Islands Time",
    id: "Indian/Cocos",
  },
  {
    label: "(GMT+06:30) Myanmar Time",
    id: "Asia/Yangon",
  },
  {
    label: "(GMT+07:00) Barnaul Time",
    id: "Asia/Barnaul",
  },
  {
    label: "(GMT+07:00) Christmas Island Time",
    id: "Indian/Christmas",
  },
  {
    label: "(GMT+07:00) Davis Time",
    id: "Antarctica/Davis",
  },
  {
    label: "(GMT+07:00) Hovd Standard Time",
    id: "Asia/Hovd",
  },
  {
    label: "(GMT+07:00) Indochina Time - Bangkok",
    id: "Asia/Bangkok",
  },
  {
    label: "(GMT+07:00) Indochina Time - Ho Chi Minh City",
    id: "Asia/Ho_Chi_Minh",
  },
  {
    label: "(GMT+07:00) Krasnoyarsk Standard Time - Krasnoyarsk",
    id: "Asia/Krasnoyarsk",
  },
  {
    label: "(GMT+07:00) Krasnoyarsk Standard Time - Novokuznetsk",
    id: "Asia/Novokuznetsk",
  },
  {
    label: "(GMT+07:00) Novosibirsk Standard Time",
    id: "Asia/Novosibirsk",
  },
  {
    label: "(GMT+07:00) Tomsk Time",
    id: "Asia/Tomsk",
  },
  {
    label: "(GMT+07:00) Western Indonesia Time - Jakarta",
    id: "Asia/Jakarta",
  },
  {
    label: "(GMT+07:00) Western Indonesia Time - Pontianak",
    id: "Asia/Pontianak",
  },
  {
    label: "(GMT+08:00) Australian Western Standard Time",
    id: "Australia/Perth",
  },
  {
    label: "(GMT+08:00) Brunei Darussalam Time",
    id: "Asia/Brunei",
  },
  {
    label: "(GMT+08:00) Central Indonesia Time",
    id: "Asia/Makassar",
  },
  {
    label: "(GMT+08:00) China Standard Time - Macao",
    id: "Asia/Macau",
  },
  {
    label: "(GMT+08:00) China Standard Time - Shanghai",
    id: "Asia/Shanghai",
  },
  {
    label: "(GMT+08:00) Hong Kong Standard Time",
    id: "Asia/Hong_Kong",
  },
  {
    label: "(GMT+08:00) Irkutsk Standard Time",
    id: "Asia/Irkutsk",
  },
  {
    label: "(GMT+08:00) Malaysia Time - Kuala Lumpur",
    id: "Asia/Kuala_Lumpur",
  },
  {
    label: "(GMT+08:00) Malaysia Time - Kuching",
    id: "Asia/Kuching",
  },
  {
    label: "(GMT+08:00) Philippine Standard Time",
    id: "Asia/Manila",
  },
  {
    label: "(GMT+08:00) Singapore Standard Time",
    id: "Asia/Singapore",
  },
  {
    label: "(GMT+08:00) Taipei Standard Time",
    id: "Asia/Taipei",
  },
  {
    label: "(GMT+08:00) Ulaanbaatar Standard Time - Choibalsan",
    id: "Asia/Choibalsan",
  },
  {
    label: "(GMT+08:00) Ulaanbaatar Standard Time - Ulaanbaatar",
    id: "Asia/Ulaanbaatar",
  },
  {
    label: "(GMT+08:45) Australian Central Western Standard Time",
    id: "Australia/Eucla",
  },
  {
    label: "(GMT+09:00) East Timor Time",
    id: "Asia/Dili",
  },
  {
    label: "(GMT+09:00) Eastern Indonesia Time",
    id: "Asia/Jayapura",
  },
  {
    label: "(GMT+09:00) Japan Standard Time",
    id: "Asia/Tokyo",
  },
  {
    label: "(GMT+09:00) Korean Standard Time - Pyongyang",
    id: "Asia/Pyongyang",
  },
  {
    label: "(GMT+09:00) Korean Standard Time - Seoul",
    id: "Asia/Seoul",
  },
  {
    label: "(GMT+09:00) Palau Time",
    id: "Pacific/Palau",
  },
  {
    label: "(GMT+09:00) Yakutsk Standard Time - Chita",
    id: "Asia/Chita",
  },
  {
    label: "(GMT+09:00) Yakutsk Standard Time - Khandyga",
    id: "Asia/Khandyga",
  },
  {
    label: "(GMT+09:00) Yakutsk Standard Time - Yakutsk",
    id: "Asia/Yakutsk",
  },
  {
    label: "(GMT+09:30) Australian Central Standard Time",
    id: "Australia/Darwin",
  },
  {
    label: "(GMT+10:00) Australian Eastern Standard Time - Brisbane",
    id: "Australia/Brisbane",
  },
  {
    label: "(GMT+10:00) Australian Eastern Standard Time - Lindeman",
    id: "Australia/Lindeman",
  },
  {
    label: "(GMT+10:00) Chamorro Standard Time",
    id: "Pacific/Guam",
  },
  {
    label: "(GMT+10:00) Chuuk Time",
    id: "Pacific/Chuuk",
  },
  {
    label: "(GMT+10:00) Papua New Guinea Time",
    id: "Pacific/Port_Moresby",
  },
  {
    label: "(GMT+10:00) Vladivostok Standard Time - Ust-Nera",
    id: "Asia/Ust-Nera",
  },
  {
    label: "(GMT+10:00) Vladivostok Standard Time - Vladivostok",
    id: "Asia/Vladivostok",
  },
  {
    label: "(GMT+10:30) Central Australia Time - Adelaide",
    id: "Australia/Adelaide",
  },
  {
    label: "(GMT+10:30) Central Australia Time - Broken Hill",
    id: "Australia/Broken_Hill",
  },
  {
    label: "(GMT+11:00) Bougainville Time",
    id: "Pacific/Bougainville",
  },
  {
    label: "(GMT+11:00) Casey Time",
    id: "Antarctica/Casey",
  },
  {
    label: "(GMT+11:00) Eastern Australia Time - Hobart",
    id: "Australia/Hobart",
  },
  {
    label: "(GMT+11:00) Eastern Australia Time - Macquarie",
    id: "Antarctica/Macquarie",
  },
  {
    label: "(GMT+11:00) Eastern Australia Time - Melbourne",
    id: "Australia/Melbourne",
  },
  {
    label: "(GMT+11:00) Eastern Australia Time - Sydney",
    id: "Australia/Sydney",
  },
  {
    label: "(GMT+11:00) Kosrae Time",
    id: "Pacific/Kosrae",
  },
  {
    label: "(GMT+11:00) Lord Howe Time",
    id: "Australia/Lord_Howe",
  },
  {
    label: "(GMT+11:00) Magadan Standard Time",
    id: "Asia/Magadan",
  },
  {
    label: "(GMT+11:00) New Caledonia Standard Time",
    id: "Pacific/Noumea",
  },
  {
    label: "(GMT+11:00) Ponape Time",
    id: "Pacific/Pohnpei",
  },
  {
    label: "(GMT+11:00) Sakhalin Standard Time",
    id: "Asia/Sakhalin",
  },
  {
    label: "(GMT+11:00) Solomon Islands Time",
    id: "Pacific/Guadalcanal",
  },
  {
    label: "(GMT+11:00) Srednekolymsk Time",
    id: "Asia/Srednekolymsk",
  },
  {
    label: "(GMT+11:00) Vanuatu Standard Time",
    id: "Pacific/Efate",
  },
  {
    label: "(GMT+12:00) Anadyr Standard Time",
    id: "Asia/Anadyr",
  },
  {
    label: "(GMT+12:00) Fiji Standard Time",
    id: "Pacific/Fiji",
  },
  {
    label: "(GMT+12:00) Gilbert Islands Time",
    id: "Pacific/Tarawa",
  },
  {
    label: "(GMT+12:00) Marshall Islands Time - Kwajalein",
    id: "Pacific/Kwajalein",
  },
  {
    label: "(GMT+12:00) Marshall Islands Time - Majuro",
    id: "Pacific/Majuro",
  },
  {
    label: "(GMT+12:00) Nauru Time",
    id: "Pacific/Nauru",
  },
  {
    label: "(GMT+12:00) Norfolk Island Time",
    id: "Pacific/Norfolk",
  },
  {
    label: "(GMT+12:00) Petropavlovsk-Kamchatski Standard Time",
    id: "Asia/Kamchatka",
  },
  {
    label: "(GMT+12:00) Tuvalu Time",
    id: "Pacific/Funafuti",
  },
  {
    label: "(GMT+12:00) Wake Island Time",
    id: "Pacific/Wake",
  },
  {
    label: "(GMT+12:00) Wallis & Futuna Time",
    id: "Pacific/Wallis",
  },
  {
    label: "(GMT+13:00) Apia Standard Time",
    id: "Pacific/Apia",
  },
  {
    label: "(GMT+13:00) New Zealand Time",
    id: "Pacific/Auckland",
  },
  {
    label: "(GMT+13:00) Phoenix Islands Time",
    id: "Pacific/Kanton",
  },
  {
    label: "(GMT+13:00) Tokelau Time",
    id: "Pacific/Fakaofo",
  },
  {
    label: "(GMT+13:00) Tonga Standard Time",
    id: "Pacific/Tongatapu",
  },
  {
    label: "(GMT+13:45) Chatham Time",
    id: "Pacific/Chatham",
  },
  {
    label: "(GMT+14:00) Line Islands Time",
    id: "Pacific/Kiritimati",
  },
] as const;

// Specify exact ISO format. This ensures consistent parsing across different browsers.
const ISO_FORMAT = "MM/DD/YYYY HH:mm:ss.SSSSSS";

export const toISOString = (timeString: string) => {
  return moment(`01-01-2024 ${timeString}`, ISO_FORMAT).format(
    "HH:mm:ss.SSSSSS"
  );
};

export const to12HrTime = (isoTime: string) => {
  return moment(`01/01/2024 ${isoTime}`, ISO_FORMAT).format("h:mm a");
};

const generateTimeOptions = () => {
  return TIME_STRINGS.map((timeString) => ({
    value: toISOString(timeString),
    inputValue: timeString,
  }));
};

export const TIME_OPTIONS = [...generateTimeOptions()] as const;

export const getDerivedTime = (userInput: string) => {
  if (!userInput) {
    return "";
  }

  const matchedPeriodOfTime = userInput.match(
    /(?<![a-zA-Z])(?:a\.?m?\.?|p\.?m?\.?)$/i
  );
  let periodOfTimeValue = matchedPeriodOfTime?.[0]?.trim();
  const timeInput = userInput.slice(
    0,
    matchedPeriodOfTime?.["index"] ?? undefined
  );
  const hourInput = timeInput?.split(":")?.[0]?.trim();
  let minuteInput = timeInput?.split(":")?.[1]?.trim();

  // Rounds off minutes so it's always 2 digits
  if (!minuteInput) {
    minuteInput = "00";
  } else if (minuteInput.length === 1) {
    minuteInput = `${minuteInput}0`;
  }

  // Determines wether we'll try to match am or pm times
  if (!periodOfTimeValue) {
    periodOfTimeValue = +hourInput >= 7 && +hourInput <= 11 ? "am" : "pm";
  } else if (periodOfTimeValue.startsWith("a")) {
    periodOfTimeValue = "am";
  } else if (periodOfTimeValue.startsWith("p")) {
    periodOfTimeValue = "pm";
  }

  return `${hourInput}:${minuteInput} ${periodOfTimeValue}`;
};

export const getClosestTimeSuggestion = (input: string) => {
  if (!input) {
    return { time: null, index: -1 };
  }

  const derivedTime = getDerivedTime(input);

  const matchedTimeIndex = TIME_OPTIONS.findIndex((time) => {
    const timeToTest = new Date(`01/01/2024 ${derivedTime}`).getTime() / 1000;

    // Makes sure that 11:53 pm to 11:59 pm are being matched to 12:00 am since it is the closest time option
    if (
      timeToTest >= 1704124380 &&
      timeToTest <= 1704124740 &&
      time.inputValue === "12:00 am"
    ) {
      return time.inputValue;
    }

    return (
      Math.abs(
        new Date(`01/01/2024 ${time.inputValue}`).getTime() / 1000 - timeToTest
      ) <= 420
    );
  });

  return {
    time: matchedTimeIndex >= 0 ? TIME_OPTIONS[matchedTimeIndex] : null,
    index: matchedTimeIndex,
  };
};
