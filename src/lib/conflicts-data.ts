import { ConflictData } from "./types";

// Curated conflict data — can be expanded or replaced with a live API
export const conflictsDatabase: Record<string, ConflictData[]> = {
  UA: [
    {
      name: "Russo-Ukrainian War",
      type: "war",
      status: "active",
      description: "Full-scale invasion by Russia; ongoing frontline combat in eastern and southern Ukraine.",
      parties: ["Ukraine", "Russia"],
      startYear: 2022,
    },
  ],
  RU: [
    {
      name: "Russo-Ukrainian War",
      type: "war",
      status: "active",
      description: "Russia's ongoing military campaign in Ukraine with international sanctions.",
      parties: ["Russia", "Ukraine"],
      startYear: 2022,
    },
  ],
  IL: [
    {
      name: "Israel-Palestine Conflict",
      type: "war",
      status: "active",
      description: "Escalation of long-standing conflict, military operations in Gaza.",
      parties: ["Israel", "Hamas", "Hezbollah"],
      startYear: 2023,
    },
  ],
  PS: [
    {
      name: "Israel-Palestine Conflict",
      type: "war",
      status: "active",
      description: "Ongoing military operations and humanitarian crisis in Gaza.",
      parties: ["Hamas", "Israel"],
      startYear: 2023,
    },
  ],
  SD: [
    {
      name: "Sudanese Civil War",
      type: "civil-conflict",
      status: "active",
      description: "Armed conflict between the Sudanese Armed Forces and the Rapid Support Forces.",
      parties: ["SAF", "RSF"],
      startYear: 2023,
    },
  ],
  MM: [
    {
      name: "Myanmar Civil War",
      type: "civil-conflict",
      status: "active",
      description: "Armed resistance against the military junta following the 2021 coup.",
      parties: ["Military Junta", "NUG", "Ethnic Armed Organizations"],
      startYear: 2021,
    },
  ],
  SY: [
    {
      name: "Syrian Conflict",
      type: "civil-conflict",
      status: "active",
      description: "Multi-party conflict with various factions and international involvement.",
      parties: ["Syrian Government", "Opposition Groups", "SDF", "ISIS remnants"],
      startYear: 2011,
    },
  ],
  YE: [
    {
      name: "Yemeni Civil War",
      type: "civil-conflict",
      status: "ceasefire",
      description: "Conflict between Houthi forces and the internationally recognized government.",
      parties: ["Houthis", "Government Forces", "Saudi-led Coalition"],
      startYear: 2014,
    },
  ],
  ET: [
    {
      name: "Ethiopian Internal Conflicts",
      type: "tension",
      status: "ceasefire",
      description: "Post-Tigray war tensions with regional instability in Amhara and Oromia.",
      parties: ["Federal Government", "Regional Forces"],
      startYear: 2020,
    },
  ],
  SO: [
    {
      name: "Somali Insurgency",
      type: "civil-conflict",
      status: "active",
      description: "Ongoing insurgency by Al-Shabaab against the federal government.",
      parties: ["Federal Government", "Al-Shabaab", "AMISOM"],
      startYear: 2009,
    },
  ],
  CD: [
    {
      name: "Eastern Congo Conflict",
      type: "civil-conflict",
      status: "active",
      description: "M23 rebel group conflict and multiple armed groups in eastern provinces.",
      parties: ["DRC Government", "M23", "Multiple armed groups"],
      startYear: 2022,
    },
  ],
  TW: [
    {
      name: "Taiwan Strait Tensions",
      type: "tension",
      status: "frozen",
      description: "Escalating military posturing and diplomatic tensions across the Taiwan Strait.",
      parties: ["Taiwan", "China"],
      startYear: 1949,
    },
  ],
  KP: [
    {
      name: "Korean Peninsula Tensions",
      type: "tension",
      status: "frozen",
      description: "Ongoing nuclear threats and military provocations.",
      parties: ["North Korea", "South Korea", "United States"],
      startYear: 1953,
    },
  ],
  KR: [
    {
      name: "Korean Peninsula Tensions",
      type: "tension",
      status: "frozen",
      description: "Continued tensions with North Korea amid nuclear threats.",
      parties: ["South Korea", "North Korea"],
      startYear: 1953,
    },
  ],
  LB: [
    {
      name: "Israel-Hezbollah Conflict",
      type: "war",
      status: "ceasefire",
      description: "Cross-border conflict between Hezbollah and Israel.",
      parties: ["Hezbollah", "Israel"],
      startYear: 2023,
    },
  ],
  BF: [
    {
      name: "Sahel Insurgency",
      type: "civil-conflict",
      status: "active",
      description: "Jihadist insurgency and military governance instability.",
      parties: ["Military Government", "JNIM", "ISGS"],
      startYear: 2015,
    },
  ],
  ML: [
    {
      name: "Sahel Insurgency",
      type: "civil-conflict",
      status: "active",
      description: "Ongoing jihadist insurgency and political instability after coup.",
      parties: ["Military Government", "JNIM", "ISGS"],
      startYear: 2012,
    },
  ],
  NE: [
    {
      name: "Sahel Insurgency",
      type: "civil-conflict",
      status: "active",
      description: "Spillover jihadist violence and post-coup governance.",
      parties: ["Military Government", "Jihadist Groups"],
      startYear: 2015,
    },
  ],
};
