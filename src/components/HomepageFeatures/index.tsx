import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Fast and Reliable',
    image: require('@site/static/img/fast_reliable.png').default,
    description: (
      <>
        Test across Chromium, WebKit, and Firefox with a single API. Playwright
        ensures your tests are fast, stable, and cross-browser compatible.
      </>
    ),
  },
  {
    title: 'Auto-Wait & Resiliency',
    image: require('@site/static/img/autowait_resiliency.png').default,
    description: (
      <>
        Playwright automatically waits for elements to be actionable. No more
        manual timeouts or flaky tests due to slow networks or animations.
      </>
    ),
  },
  {
    title: 'Powerful Tooling',
    image: require('@site/static/img/powerful_tooling.png').default,
    description: (
      <>
        Debug with the Trace Viewer, generate tests instantly with Codegen, and
        inspect your app's state with the built-in Playwright Inspector.
      </>
    ),
  },
];

function Feature({title, image, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={image} className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
