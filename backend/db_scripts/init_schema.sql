
-- 1. Role
CREATE TABLE Role (
    RoleID VARCHAR(50) PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);

-- 2. User (UUID instead of VARCHAR)
CREATE TABLE "User" (
    UserID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    RoleID VARCHAR(50) NOT NULL REFERENCES Role(RoleID),
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100),
    Email VARCHAR(150) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(50),
    PasswordHash TEXT NOT NULL,
    CreateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'active'
);

-- 3. Owner
CREATE TABLE Owner (
    OwnerID VARCHAR(50) PRIMARY KEY,
    UserID UUID UNIQUE NOT NULL REFERENCES "User"(UserID),
    FarmName VARCHAR(150),
    Address TEXT
);

-- 4. Manager
CREATE TABLE Manager (
    ManagerID VARCHAR(50) PRIMARY KEY,
    OwnerID VARCHAR(50) NOT NULL REFERENCES Owner(OwnerID),
    UserID UUID UNIQUE NOT NULL REFERENCES "User"(UserID)
);

-- 5. Buyer
CREATE TABLE Buyer (
    BuyerID VARCHAR(50) PRIMARY KEY,
    UserID UUID UNIQUE NOT NULL REFERENCES "User"(UserID),
    Address TEXT,
    Company VARCHAR(150)
);

-- 6. Breed
CREATE TABLE Breed (
    BreedID VARCHAR(50) PRIMARY KEY,
    BreedName VARCHAR(100) NOT NULL,
    EggType VARCHAR(50),
    AvgLifespan INT,
    AvgDailyEggRate NUMERIC(5,2)
);

-- 7. Batch
CREATE TABLE Batch (
    BatchID VARCHAR(50) PRIMARY KEY,
    BreedID VARCHAR(50) NOT NULL REFERENCES Breed(BreedID),
    StartDate DATE NOT NULL,
    InitialCount INT NOT NULL,
    CurrentCount INT,
    Status VARCHAR(20) DEFAULT 'active'
);

-- 8. FeedStock
CREATE TABLE FeedStock (
    StockID VARCHAR(50) PRIMARY KEY,
    FeedType VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Owner_Manager_FeedStock
CREATE TABLE Owner_Manager_FeedStock (
    OwnerID VARCHAR(50) NOT NULL REFERENCES Owner(OwnerID),
    ManagerID VARCHAR(50) NOT NULL REFERENCES Manager(ManagerID),
    StockID VARCHAR(50) NOT NULL REFERENCES FeedStock(StockID),
    PRIMARY KEY (OwnerID, ManagerID, StockID)
);

-- 10. Owner_Manager_Batch
CREATE TABLE Owner_Manager_Batch (
    OwnerID VARCHAR(50) NOT NULL REFERENCES Owner(OwnerID),
    ManagerID VARCHAR(50) NOT NULL REFERENCES Manager(ManagerID),
    BatchID VARCHAR(50) NOT NULL REFERENCES Batch(BatchID),
    PRIMARY KEY (OwnerID, ManagerID, BatchID)
);

-- 11. Orders
CREATE TABLE Orders (
    OrderID VARCHAR(50) PRIMARY KEY,
    BuyerID VARCHAR(50) NOT NULL REFERENCES Buyer(BuyerID),
    Urgent BOOLEAN DEFAULT FALSE,
    OrderedDate DATE DEFAULT CURRENT_DATE,
    RequestedDate DATE,
    Status VARCHAR(20) DEFAULT 'pending'
);

-- 12. Order_Batch
CREATE TABLE Order_Batch (
    OrderID VARCHAR(50) NOT NULL REFERENCES Orders(OrderID),
    BatchID VARCHAR(50) NOT NULL REFERENCES Batch(BatchID),
    Quantity INT NOT NULL,
    PRIMARY KEY (OrderID, BatchID)
);

-- 13. DailyOperations
CREATE TABLE DailyOperations (
    OperationID VARCHAR(50) PRIMARY KEY,
    BatchID VARCHAR(50) NOT NULL REFERENCES Batch(BatchID),
    Date DATE NOT NULL,
    FeedUsage INT,
    EggCount INT,
    MortalityCount INT,
    WaterUsed INT,
    Notes TEXT
);

-- 14. Reports
CREATE TABLE Reports (
    ReportID VARCHAR(50) PRIMARY KEY,
    BatchID VARCHAR(50) NOT NULL REFERENCES Batch(BatchID),
    Type VARCHAR(50),
    GeneratedBy UUID REFERENCES "User"(UserID),
    GeneratedDate DATE DEFAULT CURRENT_DATE,
    FilePath TEXT
);

-- 15. Predictions
CREATE TABLE Predictions (
    PredictionID VARCHAR(50) PRIMARY KEY,
    BatchID VARCHAR(50) NOT NULL REFERENCES Batch(BatchID),
    DateGenerated DATE DEFAULT CURRENT_DATE,
    PredictedEggCount INT,
    PredictedFeedRequirement INT,
    ConfidenceLevel NUMERIC(5,2)
);

-- 16. Records (Blockchain logs)
CREATE TABLE Records (
    RecordsID VARCHAR(50) PRIMARY KEY,
    OperationsID VARCHAR(50) REFERENCES DailyOperations(OperationID),
    OrderID VARCHAR(50) REFERENCES Orders(OrderID),
    PredictionsID VARCHAR(50) REFERENCES Predictions(PredictionID),
    ReportsID VARCHAR(50) REFERENCES Reports(ReportID),
    BatchID VARCHAR(50) REFERENCES Batch(BatchID),
    EntryType VARCHAR(50),
    TimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    HashValue TEXT NOT NULL,
    PreviousHash TEXT
);

-- 17. Notifications
CREATE TABLE Notifications (
    NotificationID VARCHAR(50) PRIMARY KEY,
    UserID UUID NOT NULL REFERENCES "User"(UserID),
    Message TEXT NOT NULL,
    Type VARCHAR(50),
    CreateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN DEFAULT FALSE
);

-- 18. Settings
CREATE TABLE Settings (
    SettingsID VARCHAR(50) PRIMARY KEY,
    UserID UUID NOT NULL REFERENCES "User"(UserID),
    ParameterName VARCHAR(100),
    ParameterValue VARCHAR(100),
    UpdateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
