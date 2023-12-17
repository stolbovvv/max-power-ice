<?php
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Max-Age: 1000");
  header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
  header("Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS, DELETE");

  $dir = './photos/';

  if (is_dir($dir)) {
    $files = scandir($dir);
    $images = array();
    
    foreach ($files as $file) {
      if ($file != '.' && $file != '..') {
        $images[] = $file;
      }
    }
    
    echo json_encode($images);
  } else {
    echo json_encode(array());
  }
?>