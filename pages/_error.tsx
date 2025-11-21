import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';

type ErrorProps = {
  statusCode?: number;
};

/**
 * Fallback minimal pour satisfaire Next.js lorsque l'app router est utilisé seul.
 * Sans ce fichier, `next start` tente quand même de charger `pages/_error`
 * ce qui provoque une erreur et empêche le serveur de démarrer.
 */
function CustomError({ statusCode }: ErrorProps) {
  return <NextErrorComponent statusCode={statusCode ?? 500} />;
}

CustomError.getInitialProps = async (context: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context);

  return {
    ...errorInitialProps,
    statusCode: errorInitialProps.statusCode ?? 500,
  };
};

export default CustomError;









