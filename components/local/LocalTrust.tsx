import GoogleReviews from "./GoogleReviews";
import LocationMap from "./LocationMap";

/**
 * Bottom-of-page local block for the homepage and every service page:
 * live Google reviews, then the Google Map (the map sits last, directly above
 * the footer). Server component — passed into the client pages as a slot.
 */
export default function LocalTrust() {
  return (
    <>
      <GoogleReviews />
      <LocationMap />
    </>
  );
}
