
<?php

header("Content-Type: application/json");

$host = "127.0.0.1";
$dbname = "user_management";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);

    exit;
}
