import { FetcherProvider } from './Fetcher/FetcherProvider';
import PropTypes from 'prop-types';

export const AppProvider = ({ children }) => {
  return <FetcherProvider>{children}</FetcherProvider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
