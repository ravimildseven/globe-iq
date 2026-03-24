import { safetyLevel } from "./travelData";
import { conflictsDatabase } from "./conflicts-data";
import { HDI } from "./hdi-data";

export interface SafetyScore {
  score: number;
  level: "Excellent" | "Moderate" | "High Risk";
  colorHex: string;
  breakdown: string[];
}

export function getSafetyScore(countryCode: string): SafetyScore {
  let score = 0;
  const breakdown: string[] = [];
  
  // Base Travel Safety
  const travelSafety = safetyLevel[countryCode] || "caution";
  if (travelSafety === "safe") { score += 60; breakdown.push("+60 pts: Low travel risk"); }
  else if (travelSafety === "caution") { score += 30; breakdown.push("+30 pts: Moderate travel risk"); }
  else { score += 0; breakdown.push("+0 pts: High travel risk"); }

  // HDI / Infrastructure (Up to 20 pts)
  const hdi = HDI[countryCode] || 0.650; 
  const hdiPts = Math.round(hdi * 20);
  score += hdiPts;
  breakdown.push(`+${hdiPts} pts: Infrastructure index`);

  // Baseline Buffer Points
  score += 20;
  breakdown.push(`+20 pts: Base stability buffer`);

  // Conflict Deduction
  let deduction = 0;
  let conflictReason = "";
  const conflicts = conflictsDatabase[countryCode] || [];
  for (const c of conflicts) {
    if (c.status === "active") {
      if (c.severity === "high" && deduction < 45) { deduction = 45; conflictReason = "Active high-severity conflict"; }
      else if (c.severity === "medium" && deduction < 25) { deduction = 25; conflictReason = "Active medium-severity conflict"; }
      else if (deduction < 10) { deduction = 10; conflictReason = "Active localized conflict"; }
    } else if (c.status === "ceasefire" && deduction < 10) {
      deduction = 10; conflictReason = "Recent ceasefire";
    }
  }

  // Constrain nicely
  const finalScore = Math.max(0, Math.min(100, score - deduction));
  if (deduction > 0) breakdown.push(`-${deduction} pts: ${conflictReason}`);

  // Assignment of visual indicators
  let level: "Excellent" | "Moderate" | "High Risk" = "Excellent";
  let colorHex = "#10B981"; // default green

  if (finalScore >= 75) {
    level = "Excellent";
    colorHex = "#10B981"; // Emerald-500
  } else if (finalScore >= 45) {
    level = "Moderate";
    colorHex = "#F59E0B"; // Amber-500
  } else {
    level = "High Risk";
    colorHex = "#EF4444"; // Red-500
  }

  return { score: finalScore, level, colorHex, breakdown };
}
