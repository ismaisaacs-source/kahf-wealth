import type { FamilyMember, HeirProfile } from "@kahf/domain";

const HEIR_RELATIONSHIPS = ["spouse", "child", "parent", "sibling"] as const;

export function buildHeirSummary(familyMembers: FamilyMember[]): HeirProfile[] {
  return HEIR_RELATIONSHIPS.map((relationship) => {
    const count = familyMembers.filter(
      (member) => member.relationship === relationship && member.alive,
    ).length;

    return {
      relationship,
      count,
      notes:
        count > 0
          ? `Potential ${relationship} heir group identified.`
          : `No living ${relationship} recorded in the current intake.`,
    };
  }).filter((profile) => profile.count > 0);
}
