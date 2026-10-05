import {
  getJobApplicationProgress,
  JOB_APPLICATION_PLATFORMS,
  setJobApplicationPlatformChecked,
  type JobApplicationPlatform,
  type JobApplicationStore,
  type JobApplicationTrack,
} from '../engine/job-applications';

interface JobApplicationChecklistProps {
  date: string;
  store: JobApplicationStore;
  onChange: (store: JobApplicationStore) => void;
}

const platformLabels: Record<JobApplicationPlatform, string> = {
  naukri: 'Naukri',
  linkedin: 'LinkedIn',
  other: 'Other platforms',
};

const tracks: Array<{ id: JobApplicationTrack; title: string }> = [
  { id: 'android', title: 'Android roles' },
  { id: 'springBoot', title: 'Spring Boot backend roles' },
];

export default function JobApplicationChecklist({ date, store, onChange }: JobApplicationChecklistProps) {
  const progress = getJobApplicationProgress(store, date);
  const day = store.completionByDate[date] ?? { android: [], springBoot: [] };

  return (
    <section className="planner-screen job-applications-screen">
      <div className="planner-screen-heading">
        <div><p className="eyebrow">Job search routine · {date}</p><h2>Job applications</h2></div>
        <span className={progress.scheduled ? 'job-due-badge' : 'job-not-due-badge'}>
          {progress.scheduled ? 'Due today' : 'Not scheduled'}
        </span>
      </div>

      <div className="job-routine-settings">
        <label>
          Repeat every
          <select aria-label="Repeat job search every" value={store.intervalDays} onChange={(event) => onChange({ ...store, intervalDays: Number(event.target.value) })}>
            {Array.from({ length: 7 }, (_, index) => index + 1).map((days) => (
              <option key={days} value={days}>{days === 1 ? 'Every day' : `Every ${days} days`}</option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input aria-label="Job search schedule start date" type="date" required value={store.startDate} onChange={(event) => {
            if (event.target.value) onChange({ ...store, startDate: event.target.value });
          }} />
        </label>
        <strong>1 hour total · 30 minutes per role</strong>
      </div>

      {progress.scheduled ? (
        <>
          <div className="job-routine-progress" role="progressbar" aria-label="Job application checklist completion" aria-valuenow={progress.completionPercent} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress.completionPercent}%` }} />
          </div>
          <p className="job-routine-progress-label">{progress.completed} of {progress.total} platform checks complete</p>
          <div className="job-track-list">
            {tracks.map((track) => {
              const checkedPlatforms = day[track.id];
              return (
                <fieldset className="job-track" key={track.id}>
                  <legend>
                    <span>{track.title}</span>
                    <strong>30 min · {checkedPlatforms.length}/3</strong>
                  </legend>
                  <div className="job-platform-list">
                    {JOB_APPLICATION_PLATFORMS.map((platform) => {
                      const inputId = `job-${date}-${track.id}-${platform}`;
                      return (
                        <label className="job-platform-item" htmlFor={inputId} key={platform}>
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={checkedPlatforms.includes(platform)}
                            onChange={(event) => onChange(setJobApplicationPlatformChecked(store, date, track.id, platform, event.target.checked))}
                          />
                          <span>{platformLabels[platform]}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <p className="job-routine-completion" role="status">
            {progress.completed === progress.total ? 'Job application routine complete for this date.' : 'Check each platform after reviewing suitable roles and applying.'}
          </p>
        </>
      ) : (
        <div className="interview-empty-state"><p>This is not a scheduled job-search day.</p></div>
      )}
    </section>
  );
}