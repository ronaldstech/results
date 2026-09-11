<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../db.php";
require_once "../fpdf/fpdf.php";
require_once "../functions.php";
require_once "../pdfs/reports.php";

function reportPdfError($message, $status = 400) {
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["status" => false, "message" => $message]);
    exit;
}

$student_id = filter_input(INPUT_GET, 'student_id', FILTER_VALIDATE_INT);
if ($student_id === false || $student_id === null || $student_id < 1) {
    reportPdfError("A valid student_id is required");
}

$student_stmt = $db->prepare(
    "SELECT form, school
     FROM students
     WHERE id = ? AND status = 'active'
     LIMIT 1"
);
$student_stmt->bind_param("i", $student_id);
$student_stmt->execute();
$student = $student_stmt->get_result()->fetch_assoc();
$student_stmt->close();

if (!$student) {
    reportPdfError("Student not found", 404);
}

$academic_stmt = $db->prepare(
    "SELECT id
     FROM academic_years
     WHERE status = 'active' AND school = ?
     LIMIT 1"
);
$academic_stmt->bind_param("s", $student['school']);
$academic_stmt->execute();
$academic = $academic_stmt->get_result()->fetch_assoc();
$academic_stmt->close();

if (!$academic) {
    reportPdfError("No active academic year found", 404);
}

downloadReports(
    (int) $student['form'],
    (int) $academic['id'],
    $db,
    $student['school'],
    (int) $student_id
);
