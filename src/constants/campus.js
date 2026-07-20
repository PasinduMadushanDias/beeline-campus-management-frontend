// CAMPUS_CODE disambiguates QR payloads across separate deployments/instances
// of this system (different databases, different organizations). branchId
// alone is not globally unique, so without this prefix two independent
// deployments could generate colliding QR payloads for different students.
//
// IMPORTANT: This must be unique per deployed instance/organization, and
// must NEVER be changed after students already have printed stickers —
// changing it invalidates every existing physical sticker.
export const CAMPUS_CODE = "BEELINE";
