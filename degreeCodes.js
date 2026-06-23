// degreeCodes.js - Degree code mappings for SSUET

export const degreeCodes = {
    // Engineering Degrees
    BSE: "Software Engineering",
    BCS: "Computer Science",
    BEE: "Electrical Engineering",
    BCE: "Civil Engineering",
    BME: "Mechanical Engineering",
    BBE: "Bio-Medical Engineering",
    BTE: "Telecommunication Engineering",
    BECE: "Electronics Engineering",
    BCT: "Computer Technology",
    BET: "Electronics Technology",

    // Business Degrees
    BBA: "Business Administration",
    BSAF: "Accounting & Finance",
    BSM: "Marketing",
    BSHRM: "Human Resource Management",

    // Science Degrees
    BSSE: "Software Engineering",
    BSCS: "Computer Science",
    BSAI: "Artificial Intelligence",
    BSDS: "Data Science",
    BSIT: "Information Technology",
    BSCY: "Cyber Security",

    // Master's Degrees
    MSE: "Software Engineering",
    MCS: "Computer Science",
    MEE: "Electrical Engineering",
    MBA: "Business Administration",
    MSAI: "Artificial Intelligence",
    MSDS: "Data Science",

    // PhD Degrees
    PHDCS: "PhD Computer Science",
    PHDEE: "PhD Electrical Engineering",
    PHDSE: "PhD Software Engineering",
};

export const getDegreeName = (code) => {
    return degreeCodes[code] || code;
};

export const getDegreeCode = (name) => {
    for (const [code, degreeName] of Object.entries(degreeCodes)) {
        if (degreeName === name) return code;
    }
    return null;
};

export const getAllDegrees = () => {
    return Object.entries(degreeCodes).map(([code, name]) => ({
        code,
        name,
    }));
};

export const getDegreeColor = (degree) => {
    const colors = {
        BSE: "#4B0082",
        BCS: "#006633",
        BEE: "#FF8C00",
        BCE: "#00CED1",
        BME: "#FF6B35",
        BBA: "#6B3FA0",
        MS: "#17a2b8",
        PHD: "#dc3545",
    };

    for (const [prefix, color] of Object.entries(colors)) {
        if (degree.startsWith(prefix)) return color;
    }
    return "#6c757d";
};

export const getBatchRange = (batchYear) => {
    const startYear = batchYear;
    const endYear = batchYear + 4;
    return `${startYear} - ${endYear}`;
};

export const getSemesterName = (semesterCode) => {
    if (semesterCode === "F") return "Fall Semester";
    if (semesterCode === "S") return "Spring Semester";
    return semesterCode;
};

export const formatRegistrationNumber = (regNo) => {
    if (!regNo) return "";
    const match = regNo.match(/^(\d{4})(F|S)-([A-Z]{3,4})-(\d{1,3})$/i);
    if (match) {
        const [, year, semester, degree, roll] = match;
        return `${year} ${semester === "F" ? "Fall" : "Spring"} - ${degree} - Roll #${roll}`;
    }
    return regNo;
};
