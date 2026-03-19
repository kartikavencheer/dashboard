// export interface Submission {
//   submission_id: string;
//   media_url: string;
//   media_type: "IMAGE" | "VIDEO";
//   status: string;
//   team_name?: string;
//   user_name?: string;
//   media_name?: string;
// }
export type VenuePlayoutQueue = {
  id: string;
  play_order: number;
  play_status: string;
};

export type Submission = {
  submission_id: string;
  event_id: string;
  user_id: string;
  category_id: string;
  team_id: string;
  media_type: string;
  media_url: string;
  status: string;

  team?: any;
  user?: any;
  category?: any;

  venueplayoutqueues?: VenuePlayoutQueue[];
};
