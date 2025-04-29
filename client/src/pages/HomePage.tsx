import { useState, useEffect, ChangeEvent } from "react";

// Define types for our data structures
type CheckboxItem = {
  id: number;
  label: string;
};

type CheckedState = {
  [key: number]: boolean;
};

type AdditionalInfoState = {
  [key: number]: string;
};

type UrlPayload = {
  // originalUrl: string;
  finalUrl: string;
  // parameters: {
  //   [key: string]: string;
  // };
  expirationDate?: string; // Optional field
};

function HomePage() {
  
  const [checkedState, setCheckedState] = useState<CheckedState>({});
  const [url, setUrl] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [urlErrorMessage, setUrlErrorMessage] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoState>({});
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [isExpirationEnabled, setIsExpirationEnabled] = useState<boolean>(false);
  const [finalUrl, setFinalUrl] = useState<string>('');

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
      // If URL is invalid, don't update the final URL
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
      // Valid URL
      setIsUrlValid(true);
      setUrlErrorMessage('');
      return true;
    } catch (error) {
      setIsUrlValid(false);
      setUrlErrorMessage('Please enter a valid URL');
      return false;
    }
  };

  const handleCheckboxChange = (id: number): void => {
    setCheckedState((prev: CheckedState) => ({
      ...prev,
      [id]: !prev[id], // toggle checkbox
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
    // Only validate if there's a value or if we previously had an error
    if (value || !isUrlValid) {
      validateUrl(value);
    }
  };

  const handleExpirationChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setExpirationDate(e.target.value);
  };
  
  const handleExpirationToggle = (): void => {
    setIsExpirationEnabled((prev: boolean) => !prev);
    // Clear expiration date if disabling
    if (isExpirationEnabled) {
      setExpirationDate('');
    }
  };

  const onSubmit = (): void => {
    // Validate URL before submitting
    if (validateUrl(url)) {
      const payload: UrlPayload = { 
        // originalUrl: url,
        finalUrl: finalUrl,
        // parameters: Object.entries(checkedState)
        //   .filter(([id, isChecked]: [string, boolean]) => isChecked)
        //   .reduce((acc: {[key: string]: string}, [id, _]: [string, boolean]) => ({
        //     ...acc,
        //     [checkboxes[Number(id) - 1].label]: additionalInfo[Number(id)] || ''
        //   }), {}),
        // Only include expiration date if enabled
        ...(isExpirationEnabled && expirationDate ? { expirationDate } : {})
      };
      console.log("payload", payload);
      // Here you would typically send the payload to your backend
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
              <input
                type="date"
                id="expiration"
                className="flex-1 p-2 text-sm border border-gray-300 rounded bg-white focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition duration-200"
                disabled={!isExpirationEnabled}
                value={expirationDate}
                onChange={handleExpirationChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              className={`py-2 px-6 ${(!url || !isUrlValid) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'} rounded-lg text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              type="button"
              onClick={onSubmit}
              disabled={!url || !isUrlValid}
            >
              Shorten URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;