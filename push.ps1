git add .
If($args.Length -eq 0){
    git commit -m "Update"
}Else{
    git commit -m $Args[0]
}
git push

cd _site
git add .
If($args.Length -eq 0){
    git commit -m "Update"
}Else{
    git commit -m $Args[0]
}
git push
cd ../