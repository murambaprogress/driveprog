import React from 'react';

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // If it's a chunk load error, try a full reload to recover
    const message = (error && error.message) || '';
    if (message && message.includes('Loading chunk')) {
      // Give a short delay to allow dev server to settle
      setTimeout(() => {
        window.location.reload(true);
      }, 50);
    } else {
      // eslint-disable-next-line no-console
      console.error('Unhandled error in ChunkErrorBoundary:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h3>Unexpected error occurred.</h3>
          <p>Attempting to reload the application to recover...</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
