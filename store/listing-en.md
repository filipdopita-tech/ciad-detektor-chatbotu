# Chrome Web Store listing · English

## Name (max 75 characters)
Chatbot Detector by CIAD

## Short description (max 132 characters)
Shows whether a page has a chat window (chatbot) and whether the interface says a machine is replying. Sends and stores nothing.

## Detailed description
After one click on the icon, Chatbot Detector tells you two things about the page you are on.

Chat window. Whether the page has a chat window (a chatbot) and, when we can identify the vendor, which one.

A machine is replying. Whether the interface says the other side is a machine. If it does, we show the exact quote from the interface. If not, we say "signal not found". If it cannot be told without opening the window, we say "cannot be determined".

The extension does not open the chat window and does not type into it. It reads only the labels and text of launchers and elements pinned to a page corner. That is why on some pages you will see "cannot be determined", and the popup says "We did not open the window."

A signal, not a legal assessment. Article 50(1) of Regulation (EU) 2024/1689 places an obligation on providers of AI systems intended to interact directly with natural persons. A live chat with a human is not covered by it. The result says nothing about whether a website complies with the law.

Privacy. The extension has only the activeTab and scripting permissions and no access to websites or browsing history. It collects, stores and transmits nothing, and contains no analytics or remote code.

The method is based on measurements by Český Institut pro AI a Data (CIAD): https://ciad.cz/studie/chatboti-oznaceni-ai-act/
Study data: https://doi.org/10.5281/zenodo.23618801
Expert report: https://doi.org/10.5281/zenodo.23834833
Source code (MIT): https://github.com/filipdopita-tech/ciad-detektor-chatbotu

## Category
Productivity

## Language
Czech (default), English

## Permission justification
- activeTab: The extension touches a page only after the user clicks its icon. It gets access to the current tab so it can check it. It has no other access to websites.
- scripting: After the click it runs (chrome.scripting.executeScript) its own detekce.js script, bundled in the package, on the current tab. The script returns the result to the popup. No remote code is downloaded.
- host_permissions: not requested.

## Single purpose
Find out whether the current page has a chat window and whether the interface says a machine is replying.

## Data usage
The extension collects no user data. In every category (personally identifiable information, health, financial, authentication, communications, location, web history, user activity, website content) answer: not collected.
Certifications: data is not sold to third parties, not used outside the single purpose, not used for creditworthiness.
Note: the page content is read only locally during the check. Nothing leaves the browser.

## Privacy policy URL
https://filipdopita-tech.github.io/ciad-detektor-chatbotu/en/

## Website URL
https://ciad.cz/studie/chatboti-oznaceni-ai-act/

## Graphics
Same files as the Czech listing: the three 1280×800 screenshots show the Czech interface of the extension; the promo tile is 440×280.
