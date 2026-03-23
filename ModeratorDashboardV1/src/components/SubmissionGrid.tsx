import SubmissionCard from "./SubmissionCard";

type Props = {
  submissions: any[];
  onAdd: (id: string) => void;
  onReject: (id: string) => void;
};

export default function SubmissionGrid({
  submissions,
  onAdd,
  onReject,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {submissions.map((s) => (
        <SubmissionCard
          key={s.submission_id}
          submission={s}
          onAdd={onAdd}
          onReject={onReject}
          isQueued
        />
      ))}
    </div>
  );
}
