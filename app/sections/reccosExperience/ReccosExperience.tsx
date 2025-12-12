import Image from 'next/image';
import { InvestorBadge } from '@/app/ui/investorBadge';
import { reccosExperienceStyles } from './reccosExperience.styles';

const stats = [
  {
    value: '90+',
    title: 'Successful',
    subtitle: 'Transaction Monthly',
  },
  {
    value: '97%',
    title: 'Customer',
    subtitle: 'Satisfaction Rate',
  },
  {
    value: '127',
    title: 'Property',
    subtitle: 'Financed Thanks to RECCOS',
  },
];

export const ReccosExperience = () => {
  return (
    <section className={reccosExperienceStyles.section}>
      <div className={reccosExperienceStyles.content}>
        <div className={reccosExperienceStyles.leftColumn}>
          <p className={reccosExperienceStyles.heroCopy}>
            At RECCOS we offer more than just real estate services: we provide an unparalleled
            experience tailored to meet your needs and exceed your expectations.
          </p>

          <div className={reccosExperienceStyles.badgeRow}>
            <InvestorBadge
              avatarsOnly={true}
            />
            <div className={reccosExperienceStyles.teamCopy}>
              <span>Meet</span>
              <span>our proffesionnal Team</span>
            </div>
          </div>

          <div className={reccosExperienceStyles.statsStack}>
            {stats.map((stat, index) => (
              <div key={stat.subtitle} className={reccosExperienceStyles.statBlock}>
                <span className={reccosExperienceStyles.statValue}>{stat.value}</span>
                <div className={reccosExperienceStyles.statLabel}>
                  <span>{stat.title}</span>
                  <span>{stat.subtitle}</span>
                </div>
                {index < stats.length - 1 && (
                  <div className={reccosExperienceStyles.statDivider} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={reccosExperienceStyles.rightColumn}>
          <div className={reccosExperienceStyles.imageWrapper}>
            <Image
              src="/images/ReccosExperience.jpg"
              alt="RECCOS experience"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className={reccosExperienceStyles.image}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

