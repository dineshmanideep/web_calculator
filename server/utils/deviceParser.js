/**
 * Parse User-Agent string to extract device information
 */
export const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return {
      deviceType: "Unknown",
      browser: "Unknown",
      os: "Unknown",
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect Device Type
  let deviceType = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = "Tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent,
    )
  ) {
    deviceType = "Mobile";
  }

  // Detect Browser
  let browser = "Unknown";
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "Opera";
  } else if (ua.includes("trident") || ua.includes("msie")) {
    browser = "Internet Explorer";
  }

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows nt 10.0")) {
    os = "Windows 10/11";
  } else if (ua.includes("windows nt 6.3")) {
    os = "Windows 8.1";
  } else if (ua.includes("windows nt 6.2")) {
    os = "Windows 8";
  } else if (ua.includes("windows nt 6.1")) {
    os = "Windows 7";
  } else if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac os x")) {
    const match = userAgent.match(/mac os x (\d+[._]\d+)/i);
    os = match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
  } else if (ua.includes("android")) {
    const match = userAgent.match(/android (\d+(\.\d+)?)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    const match = userAgent.match(/os (\d+_\d+)/i);
    os = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("ubuntu")) {
    os = "Ubuntu";
  } else if (ua.includes("fedora")) {
    os = "Fedora";
  }

  return {
    deviceType,
    browser,
    os,
  };
};
