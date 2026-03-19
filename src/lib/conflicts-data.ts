import { ConflictData } from "./types";

// Comprehensive conflict database — accurate as of March 2026
export const conflictsDatabase: Record<string, ConflictData[]> = {

  // ── ACTIVE WARS ────────────────────────────────────────────────────────────

  UA: [
    {
      name: "Russo-Ukrainian War",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "Russia's full-scale invasion, launched in February 2022, continues with intense frontline combat across eastern Ukraine (Donetsk, Zaporizhzhia) and ongoing Russian missile and drone strikes targeting civilian infrastructure. Casualty figures on both sides number in the hundreds of thousands.",
      parties: ["Ukraine", "Russia", "NATO (material support)"],
      startYear: 2022,
    },
  ],

  RU: [
    {
      name: "Russo-Ukrainian War",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "Russia continues its large-scale military campaign inside Ukraine, sustaining enormous personnel and equipment losses while pressing incremental territorial gains in Donetsk. International sanctions and military assistance to Ukraine have significantly degraded Russian economic and military capacity.",
      parties: ["Russia", "Ukraine"],
      startYear: 2022,
    },
  ],

  PS: [
    {
      name: "Gaza War",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "Following the Hamas-led 7 October 2023 attacks that killed ~1,200 Israelis and took ~250 hostages, Israel launched a sustained air and ground campaign in Gaza. As of early 2026 the conflict has caused over 45,000 Palestinian deaths and triggered a major humanitarian crisis with most of Gaza's infrastructure destroyed.",
      parties: ["Israel", "Hamas", "Palestinian Islamic Jihad"],
      startYear: 2023,
    },
    {
      name: "West Bank Violence",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Concurrent with Gaza operations, the West Bank has seen sharply elevated Israeli military raids, settler violence, and Palestinian armed attacks, with 2024 recording the highest West Bank Palestinian death toll since the Second Intifada.",
      parties: ["Israeli Security Forces", "Palestinian Armed Groups", "Settlers"],
      startYear: 2023,
    },
  ],

  IL: [
    {
      name: "Gaza War",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "Israel's military campaign in Gaza, launched after the 7 October 2023 Hamas attack, is one of the most destructive conflicts in the region's modern history. Israeli forces are operating across northern and southern Gaza while managing ongoing rocket fire and continuing hostage negotiations.",
      parties: ["Israel", "Hamas", "Palestinian Islamic Jihad"],
      startYear: 2023,
    },
    {
      name: "West Bank Violence",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Israel-PA tensions and Israeli military counter-terrorism operations in the West Bank have intensified since October 2023, with major incursions into Jenin, Tulkarm, and Nablus camp areas displacing tens of thousands of Palestinians.",
      parties: ["Israeli Security Forces", "Palestinian Armed Groups"],
      startYear: 2023,
    },
  ],

  SD: [
    {
      name: "Sudan Civil War (SAF vs RSF)",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "The Sudanese Armed Forces and the paramilitary Rapid Support Forces have been fighting a catastrophic civil war since April 2023, producing the world's largest displacement crisis with over 10 million internally displaced people and widespread atrocities including ethnic cleansing in Darfur.",
      parties: ["Sudanese Armed Forces (SAF)", "Rapid Support Forces (RSF)"],
      startYear: 2023,
    },
  ],

  MM: [
    {
      name: "Myanmar Civil War",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Since the February 2021 military coup, Myanmar's junta has faced a multi-front armed resistance from the People's Defence Force and established Ethnic Armed Organizations. The 2023 Operation 1027 offensive saw resistance forces capture major towns; by 2025 the military had lost control of large swathes of the country.",
      parties: ["Military Junta (SAC/Tatmadaw)", "People's Defence Force (PDF)", "Ethnic Armed Organizations (EAOs)"],
      startYear: 2021,
    },
  ],

  CD: [
    {
      name: "Eastern Congo War (M23 / Rwanda)",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "The M23 rebel group, widely documented as backed by Rwanda, resumed major offensives in 2022 and captured the eastern city of Goma — DRC's largest eastern city — in January 2025. The conflict involves dozens of armed groups and has created one of the world's worst humanitarian crises with over 7 million displaced.",
      parties: ["DR Congo Armed Forces (FARDC)", "M23 / AFC", "Rwanda (RDF)", "SADC Mission (SAMIDRC)"],
      startYear: 2022,
    },
  ],

  SO: [
    {
      name: "Somalia / Al-Shabaab Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Al-Shabaab, an Al-Qaeda affiliate, controls large rural areas of south-central Somalia and continues to mount complex attacks on Mogadishu and other cities. The African Union Transition Mission (ATMIS) has been drawing down, raising fears of renewed territorial gains by the group.",
      parties: ["Federal Government of Somalia", "Al-Shabaab", "ATMIS / AU Forces", "US Forces (airstrikes)"],
      startYear: 2009,
    },
  ],

  NG: [
    {
      name: "Boko Haram / ISWAP Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "The Islamic State West Africa Province (ISWAP), the dominant jihadist faction after absorbing most of Boko Haram, continues to control territory around Lake Chad and carry out mass-casualty attacks across northeast Nigeria. The Nigerian military has made gains but has not broken the insurgency.",
      parties: ["Nigerian Armed Forces", "ISWAP", "Civilian Joint Task Force (CJTF)", "Multinational Joint Task Force (MNJTF)"],
      startYear: 2009,
    },
    {
      name: "Banditry and Farmer-Herder Violence",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Northwestern and north-central Nigeria face a severe security crisis driven by armed bandit groups that raid villages, kidnap for ransom, and clash with Fulani herders and farming communities. The violence has killed tens of thousands and displaced millions, overlapping with escalating communal conflict.",
      parties: ["Armed Bandit Groups", "Farmer Communities", "Herder Groups", "Nigerian Security Forces"],
      startYear: 2011,
    },
  ],

  CM: [
    {
      name: "Cameroon Anglophone / Ambazonia Conflict",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Armed separatist groups in Cameroon's English-speaking Northwest and Southwest regions have fought the military since 2016, seeking independence as 'Ambazonia'. The conflict has displaced over 700,000 people and resulted in widespread atrocities by both armed factions and the military.",
      parties: ["Cameroonian Armed Forces", "Ambazonian Separatist Groups (Amba Boys)"],
      startYear: 2016,
    },
  ],

  MZ: [
    {
      name: "Cabo Delgado Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "An ISIS-linked jihadist insurgency in Mozambique's gas-rich Cabo Delgado province has killed thousands and displaced nearly a million people since 2017. SADC and Rwandan forces have helped stabilize some areas but attacks continue, jeopardizing major offshore LNG projects.",
      parties: ["Mozambican Armed Forces (FADM)", "Ansar al-Sunna (Al-Shabaab / ISIS affiliate)", "SAMIM (SADC Mission)", "Rwandan Forces"],
      startYear: 2017,
    },
  ],

  HT: [
    {
      name: "Haiti Gang Crisis / State Collapse",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Powerful gang coalitions — especially the Viv Ansanm alliance — control an estimated 85% of Port-au-Prince as of 2025, having forced out the elected prime minister. A Kenyan-led Multinational Security Support Mission arrived in 2024 but has had limited impact; the state has effectively collapsed.",
      parties: ["Haitian National Police", "Gang Coalitions (Viv Ansanm / G9)", "Multinational Security Support Mission (MSS)"],
      startYear: 2021,
    },
  ],

  SY: [
    {
      name: "Post-Assad Transition Conflict",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Assad's government fell in December 2024 after a lightning offensive by Hayat Tahrir al-Sham (HTS). As of 2026, Syria is fragmented: HTS controls the northwest, the SDF holds the northeast, and Turkish-backed factions operate in northern border zones. Intercommunal violence, ISIS resurgence, and unclear governance create ongoing instability.",
      parties: ["Hayat Tahrir al-Sham (HTS / new Syrian government)", "Syrian Democratic Forces (SDF)", "Turkish-Backed Syrian National Army (SNA)", "ISIS remnants"],
      startYear: 2024,
    },
  ],

  // ── SAHEL ──────────────────────────────────────────────────────────────────

  ML: [
    {
      name: "Mali Sahel Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Mali's military junta, partnered with Russia's Africa Corps (formerly Wagner), faces a severe jihadist insurgency led by JNIM (al-Qaeda affiliate) and ISGS (ISIS affiliate). After expelling French and UN forces, the junta's military situation has worsened, with JNIM now threatening central Mali and Bamako's periphery.",
      parties: ["Malian Armed Forces (FAMa)", "Africa Corps (Russia/Wagner)", "JNIM (al-Qaeda affiliate)", "ISGS (ISIS affiliate)"],
      startYear: 2012,
    },
  ],

  BF: [
    {
      name: "Burkina Faso Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Burkina Faso's military junta faces the world's fastest-growing displacement crisis, with jihadist groups controlling an estimated 40–60% of the country's territory. JNIM and ISGS have effectively blockaded several major cities, causing severe food insecurity. The junta has partnered with Africa Corps and expelled French forces.",
      parties: ["Burkinabè Armed Forces (FAB)", "Volunteers for the Defense of the Homeland (VDP)", "Africa Corps (Russia)", "JNIM", "ISGS"],
      startYear: 2015,
    },
  ],

  NE: [
    {
      name: "Niger Insurgency and Coup Aftermath",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Following the July 2023 military coup, Niger expelled French and American forces and aligned with Russia. The pre-existing jihadist insurgency along the Mali and Nigeria borders continues, while the political situation remains fragile with neighbouring ECOWAS states imposing sanctions.",
      parties: ["Nigerien Armed Forces (FAN)", "Africa Corps (Russia)", "JNIM", "ISGS"],
      startYear: 2015,
    },
  ],

  TD: [
    {
      name: "Chad Internal Conflict and Sudan Spillover",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Chad faces armed rebel groups along its eastern border exacerbated by the Sudanese civil war's RSF spillover, intercommunal violence, and political tensions following the 2021 transitional period. President Mahamat Idriss Déby won a disputed election in 2024 amid continued fragility.",
      parties: ["Chadian Armed Forces (ANT)", "Various Rebel Factions", "RSF (Sudan spillover)"],
      startYear: 2021,
    },
  ],

  // ── LOWER INTENSITY ────────────────────────────────────────────────────────

  AF: [
    {
      name: "ISIS-K Insurgency Against Taliban",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Since the Taliban takeover in August 2021, ISIS-Khorasan Province (ISIS-K) has conducted hundreds of terrorist attacks inside Afghanistan targeting Taliban officials, ethnic minorities (especially Hazara Shia), and foreign interests. The Taliban has struggled to suppress the group despite brutal counter-measures.",
      parties: ["Taliban (Islamic Emirate of Afghanistan)", "ISIS-Khorasan Province (ISIS-K)"],
      startYear: 2021,
    },
  ],

  IQ: [
    {
      name: "ISIS Remnants Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Despite territorial defeat in 2017, ISIS continues a low-level insurgency in Iraq's Sunni heartlands (Anbar, Kirkuk, Diyala), carrying out ambushes and assassinations of security forces. US forces remain in Iraq under a security framework that has been politically contested following Iran-linked militia pressure.",
      parties: ["Iraqi Security Forces (ISF)", "Popular Mobilisation Forces (PMF)", "ISIS remnants", "US Forces (advise & assist)"],
      startYear: 2017,
    },
  ],

  CO: [
    {
      name: "Colombian Conflict (FARC Dissidents / ELN)",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Despite the 2016 FARC peace deal, dissident factions (EMC / Estado Mayor Central) and the ELN guerrilla group continue armed conflict over coca territories and criminal economies. President Petro's 'total peace' negotiations have stalled, with periodic ceasefires collapsing.",
      parties: ["Colombian Security Forces", "FARC Dissidents (EMC)", "National Liberation Army (ELN)"],
      startYear: 2016,
    },
  ],

  MX: [
    {
      name: "Mexican Cartel Wars",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Mexico's powerful drug cartels — including the Sinaloa Cartel (now internally fractured after the 2024 Chapitos-El Mayo split) and the Jalisco New Generation Cartel — continue fighting each other and the state in some of the world's highest homicide-rate territories. Annual homicides consistently exceed 30,000.",
      parties: ["Mexican Security Forces", "Sinaloa Cartel", "CJNG (Jalisco Cartel)", "Other Regional Cartels"],
      startYear: 2006,
    },
  ],

  PK: [
    {
      name: "TTP Insurgency / Baloch Separatism",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "The Tehrik-i-Taliban Pakistan (TTP) has dramatically escalated attacks on Pakistani security forces since 2022, killing hundreds of soldiers annually. Simultaneously, the Balochistan Liberation Army (BLA) has intensified separatist attacks in Balochistan, including the August 2024 massacre of over 100 people.",
      parties: ["Pakistani Armed Forces", "Tehrik-i-Taliban Pakistan (TTP)", "Balochistan Liberation Army (BLA)"],
      startYear: 2007,
    },
  ],

  TR: [
    {
      name: "PKK Conflict",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Turkey's armed conflict with the Kurdistan Workers' Party (PKK) continues across southeastern Turkey, northern Iraq (Kandil mountains), and Syria. Turkish forces conduct regular cross-border air strikes and ground operations. A February 2025 peace overture by jailed PKK leader Öcalan created cautious dialogue prospects.",
      parties: ["Turkish Armed Forces", "Kurdistan Workers' Party (PKK)", "PKK-linked YPG/SDF (Syria)"],
      startYear: 1984,
    },
  ],

  PH: [
    {
      name: "Mindanao / Abu Sayyaf and NPA",
      type: "civil-conflict",
      status: "active",
      severity: "low",
      description:
        "The Philippines faces low-level conflict in Mindanao from Abu Sayyaf Group (ASG) kidnappings and the communist New People's Army (NPA), both of which have declined significantly but continue sporadic violence. Peace talks with the NPA remain stalled while government forces press an 'End Local Communist Armed Conflict' strategy.",
      parties: ["Armed Forces of the Philippines (AFP)", "Abu Sayyaf Group (ASG)", "New People's Army (NPA)"],
      startYear: 2000,
    },
  ],

  EG: [
    {
      name: "Sinai ISIS Province Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "ISIS's Wilayat Sinai affiliate continues a low-level insurgency in North Sinai against Egyptian security forces and civilians, though the Egyptian military's intensive counter-insurgency operations since 2018 have significantly degraded the group's capabilities and reduced attack frequency.",
      parties: ["Egyptian Armed Forces", "ISIS Sinai Province (Wilayat Sinai)"],
      startYear: 2013,
    },
  ],

  LY: [
    {
      name: "Libya Political-Military Split",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Libya remains divided between the UN-recognized Government of National Unity (GNU) in Tripoli and the Libyan National Army (LNA) led by Field Marshal Khalifa Haftar controlling the east. Despite ceasefire lines holding since 2020, inter-militia clashes inside Tripoli recur and a political reunification path remains elusive.",
      parties: ["Government of National Unity (GNU)", "Libyan National Army (LNA / Haftar)", "Turkey (backing GNU)", "Russia / UAE / Egypt (backing LNA)"],
      startYear: 2014,
    },
  ],

  ID: [
    {
      name: "Papua / West Papua Separatist Conflict",
      type: "civil-conflict",
      status: "active",
      severity: "low",
      description:
        "The West Papua National Liberation Army (TPNPB), armed wing of the Free Papua Movement, conducts sporadic attacks on Indonesian security forces and civilians including hostage-taking in the remote Highlands. Indonesia's military operations in the newly-created Papua provinces continue amid international human rights concerns.",
      parties: ["Indonesian Armed Forces (TNI)", "West Papua National Liberation Army (TPNPB / OPM)"],
      startYear: 1963,
    },
  ],

  IR: [
    {
      name: "Iran-Israel Shadow War",
      type: "tension",
      status: "active",
      severity: "high",
      description:
        "Iran and Israel exchanged direct unprecedented strikes in April and October 2024, marking a new escalatory threshold. Israel has degraded Iran's air defenses and proxy networks; Iran's Axis of Resistance (Hezbollah, Hamas, Houthis) has suffered severe setbacks, but Iran continues missile and drone development and threatens retaliation.",
      parties: ["Iran (IRGC)", "Israel (IDF)", "Iranian proxies (Hezbollah, Houthis, Iraqi militias)"],
      startYear: 2010,
    },
    {
      name: "Kurdish PJAK Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "The Free Life Party of Kurdistan (PJAK), a PKK-affiliated Kurdish militant group, conducts periodic attacks on Iranian security forces in the Kurdistan Province. Iran carries out artillery and drone strikes on PJAK bases in Iraqi Kurdistan.",
      parties: ["Iranian Security Forces (IRGC)", "PJAK"],
      startYear: 2004,
    },
  ],

  ET: [
    {
      name: "Amhara Fano Conflict",
      type: "civil-conflict",
      status: "active",
      severity: "high",
      description:
        "Following the Tigray war ceasefire, the Ethiopian government entered a new armed conflict with Fano militia fighters in the Amhara region from 2023. The federal government declared a state of emergency and deployed military forces; internet shutdowns and civilian displacement continue as of 2026.",
      parties: ["Ethiopian National Defence Force (ENDF)", "Fano Amhara Militia"],
      startYear: 2023,
    },
    {
      name: "Oromia OLA Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "The Oromo Liberation Army (OLA / Shane) continues a low-to-medium intensity insurgency in western Oromia regions, carrying out attacks on security forces and civilians. Peace talks have repeatedly collapsed and the conflict has displaced hundreds of thousands.",
      parties: ["Ethiopian National Defence Force (ENDF)", "Oromo Liberation Army (OLA)"],
      startYear: 2018,
    },
  ],

  VE: [
    {
      name: "Venezuela Post-Election Crisis",
      type: "tension",
      status: "active",
      severity: "medium",
      description:
        "Following the disputed July 2024 presidential election in which Nicolás Maduro claimed victory despite credible evidence of fraud, Venezuela faces sustained political repression, mass arrests of opposition figures, and continuing economic collapse driving emigration — now the world's largest displacement crisis outside conflict zones.",
      parties: ["Maduro Government", "Democratic Opposition (MUD / PUD)", "International Community"],
      startYear: 2024,
    },
  ],

  IN: [
    {
      name: "Kashmir Insurgency",
      type: "civil-conflict",
      status: "active",
      severity: "medium",
      description:
        "Pakistan-linked militant groups continue to carry out attacks in Jammu & Kashmir, particularly in the Jammu region and the Pir Panjal area where attacks have increased since 2023. India maintains a heavy security presence in the Union Territory following the revocation of Article 370 in 2019.",
      parties: ["Indian Security Forces", "Lashkar-e-Taiba (LeT)", "Jaish-e-Mohammed (JeM)", "The Resistance Front"],
      startYear: 1989,
    },
    {
      name: "India-China LAC Standoff",
      type: "tension",
      status: "ceasefire",
      severity: "medium",
      description:
        "After the deadly June 2020 Galwan Valley clash, India and China negotiated disengagement at multiple friction points along the Line of Actual Control (LAC) in Ladakh. As of October 2024, both sides announced full patrolling resumption at the remaining standoff points, though underlying territorial disputes remain unresolved.",
      parties: ["Indian Armed Forces", "People's Liberation Army (PLA)"],
      startYear: 2020,
    },
  ],

  // ── CEASEFIRE / FRAGILE ───────────────────────────────────────────────────

  LB: [
    {
      name: "Israel-Hezbollah War / Ceasefire",
      type: "war",
      status: "ceasefire",
      severity: "medium",
      description:
        "After months of escalating cross-border exchanges, Israel launched a ground invasion of Lebanon in October 2024, assassinating Hezbollah Secretary-General Nasrallah and inflicting severe damage. A US-brokered ceasefire took effect in late November 2024, but Lebanese political uncertainty and periodic violations make the situation fragile.",
      parties: ["Israel (IDF)", "Hezbollah", "Lebanese Armed Forces", "UNIFIL"],
      startYear: 2023,
    },
  ],

  YE: [
    {
      name: "Yemen Civil War",
      type: "civil-conflict",
      status: "ceasefire",
      severity: "medium",
      description:
        "Yemen's civil war between the Houthi movement (Ansar Allah) and the internationally recognized government, backed by the Saudi-led coalition, remains in a fragile UN-brokered truce. Saudi Arabia and the Houthis have been engaged in backchannel negotiations, but a comprehensive peace agreement has not been reached.",
      parties: ["Houthi Movement (Ansar Allah)", "Presidential Leadership Council (PLC)", "Saudi-led Coalition"],
      startYear: 2014,
    },
    {
      name: "Red Sea Houthi Attacks",
      type: "war",
      status: "active",
      severity: "high",
      description:
        "The Houthis began attacking commercial shipping in the Red Sea in November 2023 in stated solidarity with Gaza, severely disrupting global maritime trade through the Suez Canal route. The US and UK conducted hundreds of airstrikes on Houthi targets, but the attacks continued through 2025, significantly raising shipping insurance costs worldwide.",
      parties: ["Houthi Movement (Ansar Allah)", "US / UK Naval Forces (Operation Prosperity Guardian)", "Commercial Shipping"],
      startYear: 2023,
    },
  ],

  AM: [
    {
      name: "Armenia-Azerbaijan Post-Karabakh Tensions",
      type: "tension",
      status: "ceasefire",
      severity: "medium",
      description:
        "Following Azerbaijan's lightning offensive that retook Nagorno-Karabakh in September 2023, nearly the entire ethnic Armenian population fled. Armenia and Azerbaijan are engaged in peace treaty negotiations but major issues — border demarcation and Zangezur corridor — remain unresolved, with sporadic border incidents.",
      parties: ["Armenia", "Azerbaijan"],
      startYear: 2020,
    },
  ],

  AZ: [
    {
      name: "Post-Karabakh Normalization",
      type: "tension",
      status: "ceasefire",
      severity: "low",
      description:
        "After Azerbaijan's decisive victory in Nagorno-Karabakh in September 2023, the two countries are negotiating a peace treaty. Azerbaijan is pressing Armenia to provide a transit corridor through Syunik (Zangezur) while Armenia resists. The situation is relatively stable for Azerbaijan but politically sensitive.",
      parties: ["Azerbaijan", "Armenia"],
      startYear: 2020,
    },
  ],

  // ── FROZEN / TENSIONS ─────────────────────────────────────────────────────

  TW: [
    {
      name: "Taiwan Strait Military Tensions",
      type: "tension",
      status: "frozen",
      severity: "high",
      description:
        "China's People's Liberation Army (PLA) conducted unprecedented military exercises around Taiwan in 2022 and 2024 in response to US-Taiwan interactions. China claims Taiwan as its territory and has not ruled out military force; Taiwan maintains de facto independence with US security guarantees under the Taiwan Relations Act.",
      parties: ["Taiwan (Republic of China)", "People's Republic of China (PLA)", "United States"],
      startYear: 1949,
    },
  ],

  KP: [
    {
      name: "Korean Peninsula Nuclear Tensions",
      type: "tension",
      status: "frozen",
      severity: "high",
      description:
        "North Korea has dramatically accelerated its nuclear and missile program, conducting multiple ICBM tests and claiming miniaturized warhead capability. Pyongyang declared itself an 'irreversible' nuclear state in 2022. North Korean troops were confirmed deployed to Russia to support operations in Ukraine in 2024, creating a new escalatory dimension.",
      parties: ["North Korea (DPRK)", "South Korea (ROK)", "United States", "China"],
      startYear: 1953,
    },
  ],

  KR: [
    {
      name: "Korean Peninsula Nuclear Tensions",
      type: "tension",
      status: "frozen",
      severity: "high",
      description:
        "South Korea faces continued nuclear and missile threats from North Korea, which has declared itself an irreversible nuclear state. Revelations that North Korean troops fought alongside Russian forces in Ukraine in 2024 added a new strategic dimension. South Korea's political crisis (martial law attempt by Yoon in December 2024) created additional domestic instability.",
      parties: ["South Korea (ROK)", "North Korea (DPRK)", "United States"],
      startYear: 1953,
    },
  ],

  GE: [
    {
      name: "Russian-Occupied Abkhazia and South Ossetia",
      type: "disputed",
      status: "frozen",
      severity: "medium",
      description:
        "Following the 2008 war, Russia recognizes Abkhazia and South Ossetia as independent states and maintains military bases there. The rest of the world considers them Georgian territory under occupation. The conflict is frozen but tensions have re-emerged amid Georgia's pro-Russian political drift since 2023.",
      parties: ["Georgia", "Russia", "Abkhaz Authorities", "South Ossetian Authorities"],
      startYear: 2008,
    },
  ],

  RS: [
    {
      name: "Kosovo-Serbia Tensions",
      type: "tension",
      status: "active",
      severity: "medium",
      description:
        "Serbia does not recognize Kosovo's 2008 declaration of independence and tensions over northern Kosovo (with its large Serb population) periodically escalate. A September 2023 incursion by Kosovo Serb militia caused NATO KFOR to deploy reinforcements. EU-brokered normalization talks remain stalled.",
      parties: ["Serbia", "Kosovo", "NATO KFOR", "EU Facilitation"],
      startYear: 2008,
    },
  ],
};
