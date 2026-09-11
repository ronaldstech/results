<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../db.php";

$form = filter_input(INPUT_GET, 'form', FILTER_VALIDATE_INT);
$school = strtolower(trim($_GET['school'] ?? ''));

if ($form === false || $form === null || $form < 1) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => "A valid form is required",
        "data" => []
    ]);
    exit;
}

if (!in_array($school, ['day', 'open'], true)) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => "A valid school is required: day or open",
        "data" => []
    ]);
    exit;
}

$stmt = $db->prepare(
    "SELECT id, first, middle, last, form, gender, student_reg, school
     FROM students
     WHERE form = ? AND school = ? AND status = 'active'
     ORDER BY last ASC, first ASC"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Could not prepare the students query",
        "data" => []
    ]);
    exit;
}

$stmt->bind_param("is", $form, $school);
$stmt->execute();
$result = $stmt->get_result();
$students = [];

while ($row = $result->fetch_assoc()) {
    $row['id'] = (int) $row['id'];
    $row['form'] = (int) $row['form'];
    $row['name'] = trim($row['first'] . ' ' . $row['middle'] . ' ' . $row['last']);
    $students[] = $row;
}

$stmt->close();

echo json_encode([
    "status" => true,
    "form" => $form,
    "school" => $school,
    "count" => count($students),
    "data" => $students
]);
