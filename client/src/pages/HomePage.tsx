import { useState, useEffect, ChangeEvent } from "react";
import { shortenUrl } from "../api/index"
import { AdditionalInfoState, CheckboxItem, CheckedState, UrlPayload } from "../types";

function HomePage() {

  const [checkedState, setCheckedState] = useState<CheckedState>({});
  const [url, setUrl] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [urlErrorMessage, setUrlErrorMessage] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoState>({});
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [isExpirationValid, setIsExpirationValid] = useState<boolean>(true);
  const [expirationErrorMessage, setExpirationErrorMessage] = useState<string>('');
  const [isExpirationEnabled, setIsExpirationEnabled] = useState<boolean>(false);
  const [finalUrl, setFinalUrl] = useState<string>('');
  const [shortenedUrl, setShortenedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const today = new Date().toISOString().split('T')[0];

  const checkboxes: CheckboxItem[] = [
    { id: 1, label: 'utm_source' },
    { id: 2, label: 'utm_medium' },
    { id: 3, label: 'utm_campaign' },
    { id: 4, label: 'utm_term' },
    { id: 5, label: 'utm_content' },
  ];

  // Update final URL whenever relevant states change
  useEffect(() => {
    if (url && isUrlValid) {
      updateFinalUrl();
    }
  }, [url, checkedState, additionalInfo]);

  const updateFinalUrl = (): void => {
    try {
      // Create URL object to properly handle parameters
      const urlObj = new URL(url);

      // Add parameters based on checked boxes and their additional info
      checkboxes.forEach((box: CheckboxItem) => {
        if (checkedState[box.id] && additionalInfo[box.id]) {
          urlObj.searchParams.set(box.label, additionalInfo[box.id]);
        }
      });

      setFinalUrl(urlObj.toString());
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  };

  const validateUrl = (value: string): boolean => {
    if (!value) {
      setIsUrlValid(false);
      setUrlErrorMessage('URL is required');
      return false;
    }

    try {
      const urlObj = new URL(value);
      // Check if protocol is http or https
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        setIsUrlValid(false);
        setUrlErrorMessage('URL must start with http:// or https://');
        return false;
      }
      setIsUrlValid(true);
      setUrlErrorMessage('');
      return true;
    } catch (error) {
      setIsUrlValid(false);
      setUrlErrorMessage('Please enter a valid URL');
      return false;
    }
  };

  const validateExpirationDate = (value: string): boolean => {
    if (!value && isExpirationEnabled) {
      setIsExpirationValid(false);
      setExpirationErrorMessage('Expiration date is required');
      return false;
    }

    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setIsExpirationValid(false);
        setExpirationErrorMessage('Expiration date cannot be in the past');
        return false;
      }
    }

    setIsExpirationValid(true);
    setExpirationErrorMessage('');
    return true;
  };

  const handleCheckboxChange = (id: number): void => {
    setCheckedState((prev: CheckedState) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAdditionalInfoChange = (id: number, value: string): void => {
    setAdditionalInfo((prev: AdditionalInfoState) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    setUrl(value);
    if (value || !isUrlValid) {
      validateUrl(value);
    }
  };

  const handleExpirationChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    setExpirationDate(value);
    validateExpirationDate(value);
  };

  const handleExpirationToggle = (): void => {
    setIsExpirationEnabled((prev: boolean) => !prev);
    if (isExpirationEnabled) {
      setExpirationDate('');
      setIsExpirationValid(true);
      setExpirationErrorMessage('');
    } else {
      if (expirationDate) {
        validateExpirationDate(expirationDate);
      }
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(shortenedUrl)
      .then(() => {
        alert('Shortened URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  const onSubmit = async (): Promise<void> => {
    setShortenedUrl('');
    setError('');

    // Validate URL
    if (!validateUrl(url)) {
      return;
    }

    // Validate expiration date if enabled
    if (isExpirationEnabled && !validateExpirationDate(expirationDate)) {
      return;
    }

    setIsLoading(true);

    const payload: UrlPayload = {
      finalUrl: finalUrl,
      ...(isExpirationEnabled && expirationDate ? { expirationDate } : {})
    };

    try {
      const response = await shortenUrl(payload);

      if (response && response.shortenedUrl) {
        setShortenedUrl(response.shortenedUrl);
      } else {
        setError('Received an invalid response from the server');
      }
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 justify-center items-center py-8 px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">URL Shortener</h1>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700">Enter URL</label>
            <input
              id="url-input"
              className={`w-full h-10 border ${isUrlValid ? 'border-gray-300' : 'border-red-500'} focus:ring-2 focus:ring-gray-400 focus:border-transparent rounded-lg px-3 transition duration-200 text-gray-800`}
              type="text"
              placeholder="https://example.com/long-url-to-shorten"
              value={url}
              onChange={handleUrlChange}
              onBlur={() => validateUrl(url)}
            />
            {!isUrlValid && (
              <p className="text-red-500 text-sm mt-1">{urlErrorMessage}</p>
            )}
          </div>

          {/* Checkboxes and Additional Info */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700 mb-3">Options</h2>
            <div className="space-y-4">
              {checkboxes.map((box: CheckboxItem) => (
                <div key={box.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center space-x-2 min-w-[180px]">
                    <input
                      type="checkbox"
                      id={`cb-${box.id}`}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      checked={!!checkedState[box.id]}
                      onChange={() => handleCheckboxChange(box.id)}
                    />
                    <label htmlFor={`cb-${box.id}`} className="text-gray-700 text-sm">
                      {box.label}
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Additional info"
                    className="flex-1 p-2 text-sm border border-gray-300 rounded bg-white focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition duration-200"
                    disabled={!checkedState[box.id]}
                    value={additionalInfo[box.id] || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleAdditionalInfoChange(box.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview of Final URL */}
          {finalUrl && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Preview URL</h2>
              <div className="bg-white p-3 rounded border border-gray-300 break-all">
                <p className="text-sm text-gray-800">{finalUrl}</p>
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700 mb-3">Expiration</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center space-x-2 min-w-[180px]">
                <input
                  type="checkbox"
                  id="enable-expiration"
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  checked={isExpirationEnabled}
                  onChange={handleExpirationToggle}
                />
                <label htmlFor="enable-expiration" className="text-gray-700 text-sm">
                  Expiration Date
                </label>
              </div>
              <div className="flex-1 flex flex-col">
                <input
                  type="date"
                  id="expiration"
                  className={`w-full p-2 text-sm border ${isExpirationValid ? 'border-gray-300' : 'border-red-500'} rounded bg-white focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition duration-200`}
                  disabled={!isExpirationEnabled}
                  value={expirationDate}
                  onChange={handleExpirationChange}
                  min={today} // Set minimum date to today
                />
                {isExpirationEnabled && !isExpirationValid && (
                  <p className="text-red-500 text-xs mt-1">{expirationErrorMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              className={`py-2 px-6 ${(!url || !isUrlValid || (isExpirationEnabled && !isExpirationValid) || isLoading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'} rounded-lg text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center`}
              type="button"
              onClick={onSubmit}
              disabled={!url || !isUrlValid || (isExpirationEnabled && !isExpirationValid) || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Shorten URL'
              )}
            </button>
          </div>
          {/* Shortened URL Result */}
          {shortenedUrl && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h2 className="text-lg font-medium text-green-800 mb-2">Shortened URL</h2>
              <div className="flex items-center">
                <div className="bg-white p-3 rounded border border-green-300 break-all flex-grow">
                  <p className="text-sm text-gray-800">{shortenedUrl}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;