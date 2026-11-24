
<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    $input = [];
}

try {

    // GET: Retrieve all users or one user
    if ($method === "GET") {

        $id = $_GET["id"] ?? null;

        if ($id !== null) {
            $stmt = $pdo->prepare(
                "SELECT * FROM users WHERE id = ?"
            );

            $stmt->execute([$id]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(404);
                echo json_encode(["message" => "User not found"]);
                exit;
            }

            echo json_encode($user);
        } else {
            $stmt = $pdo->query(
                "SELECT * FROM users ORDER BY id DESC"
            );

            echo json_encode($stmt->fetchAll());
        }

    }

    // POST: Add a new user
    elseif ($method === "POST") {

        $name = trim($input["name"] ?? "");
        $email = trim($input["email"] ?? "");
        $phone = trim($input["phone"] ?? "");

        if ($name === "" || $email === "") {
            http_response_code(422);

            echo json_encode([
                "message" => "Name and email are required"
            ]);

            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);

            echo json_encode([
                "message" => "Invalid email address"
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            "INSERT INTO users (name, email, phone)
             VALUES (?, ?, ?)"
        );

        $stmt->execute([$name, $email, $phone]);

        http_response_code(201);

        echo json_encode([
            "message" => "User created successfully",
            "id" => $pdo->lastInsertId()
        ]);

    }

    // PUT: Update an existing user
    elseif ($method === "PUT") {

        $id = trim($input["id"] ?? "");
        $name = trim($input["name"] ?? "");
        $email = trim($input["email"] ?? "");
        $phone = trim($input["phone"] ?? "");
        

        if (!$id || !ctype_digit((string)$id)) {
            http_response_code(400);

            echo json_encode(["message" => "Invalid user ID"]);
            exit;
        }

        if ($name === "" || $email === "") {
            http_response_code(422);

            echo json_encode([
                "message" => "Name and email are required"
            ]);

            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);

            echo json_encode([
                "message" => "Invalid email address"
            ]);

            exit;
        }

        $check = $pdo->prepare(
            "SELECT id FROM users WHERE id = ?"
        );

        $check->execute([$id]);

        if (!$check->fetch()) {
            http_response_code(404);

            echo json_encode(["message" => "User not found"]);
            exit;
        }

        $stmt = $pdo->prepare(
            "UPDATE users
             SET name = ?, email = ?, phone = ?
             WHERE id = ?"
        );

        $stmt->execute([$name, $email, $phone, $id]);

        echo json_encode([
            "message" => "User updated successfully"
        ]);

    }

    // DELETE: Remove a user
    elseif ($method === "DELETE") {

        $id = $_GET["id"] ?? null;

        if (!$id || !ctype_digit((string)$id)) {
            http_response_code(400);

            echo json_encode(["message" => "Invalid user ID"]);
            exit;
        }

        $stmt = $pdo->prepare(
            "DELETE FROM users WHERE id = ?"
        );

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);

            echo json_encode(["message" => "User not found"]);
            exit;
        }

        echo json_encode([
            "message" => "User deleted successfully"
        ]);

    }

    else {
        http_response_code(405);

        echo json_encode([
            "message" => "Method not allowed"
        ]);
    }

} catch (PDOException $e) {

    if ($e->getCode() === "23000") {
        http_response_code(409);

        echo json_encode([
            "message" => "This email address is already registered"
        ]);

    } else {
        http_response_code(500);

        echo json_encode([
            "message" => "A database error occurred"
        ]);
    }

}
